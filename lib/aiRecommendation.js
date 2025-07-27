// lib/aiRecommendation.js - Simple AI Recommendation Logic
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini 2.0 Flash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export class AIRecommendationEngine {
  
  // Extract raw material names from user input using Gemini
  static async extractRawMaterialNames(userInput) {
    const prompt = `
    Extract raw material names from: "${userInput}"

    Rules:
    - Extract food ingredients and cooking materials only
    - Include singular forms (butter, paneer, rice)
    - Ignore brands (amul, tata, patanjali, etc.)
    - Return common ingredient names
    - Focus on the actual food item, not the brand

    Examples:
    "amul butter" -> ["butter"]
    "paneer" -> ["paneer"] 
    "malai paneer" -> ["paneer"]
    "tata salt and maggi" -> ["salt", "noodles"]
    "I need tomatoes and onions" -> ["tomatoes", "onions"]
    "potato and rice" -> ["potato", "rice"]
    "fresh milk and wheat flour" -> ["milk", "wheat flour"]

    Return only JSON array: ["ingredient1", "ingredient2"]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();
      
      // Parse JSON response
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Gemini extraction error:', error);
      // Enhanced fallback: better word extraction
      const commonBrands = ['amul', 'tata', 'patanjali', 'nestle', 'maggi', 'mdh', 'everest'];
      const words = userInput.toLowerCase()
        .split(/[,\s]+/)
        .filter(word => word.length > 2)
        .filter(word => !commonBrands.includes(word))
        .map(word => word.trim());
      
      return words.length > 0 ? words : [userInput.toLowerCase().trim()];
    }
  }

  // Find matching raw materials from database with better fuzzy matching
  static async findMatchingMaterials(materialNames, allRawMaterials) {
    const matches = [];
    
    for (const materialName of materialNames) {
      const searchTerm = materialName.toLowerCase().trim();
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 2);
      
      const foundMaterials = allRawMaterials.filter(material => {
        const materialName = material.name.toLowerCase();
        const materialCategory = material.category.toLowerCase();
        const materialSubcategory = material.subcategory?.toLowerCase() || '';
        const materialWords = materialName.split(/\s+/);
        
        // Method 1: Direct word matching (any search word matches any material word)
        const hasWordMatch = searchWords.some(searchWord => 
          materialWords.some(materialWord => 
            materialWord.includes(searchWord) || 
            searchWord.includes(materialWord) ||
            materialWord.startsWith(searchWord) ||
            searchWord.startsWith(materialWord)
          )
        );
        
        // Method 2: Category matching
        const hasCategoryMatch = materialCategory.includes(searchTerm) || 
                                searchTerm.includes(materialCategory) ||
                                materialSubcategory.includes(searchTerm) ||
                                searchTerm.includes(materialSubcategory);
        
        // Method 3: Partial name matching
        const hasPartialMatch = materialName.includes(searchTerm) || 
                               searchTerm.includes(materialName);
        
        // Method 4: Tags matching (if material has tags)
        const hasTagMatch = material.tags && material.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm) || 
          searchTerm.includes(tag.toLowerCase())
        );
        
        return hasWordMatch || hasCategoryMatch || hasPartialMatch || hasTagMatch;
      });
      
      if (foundMaterials.length > 0) {
        matches.push({
          searchTerm: materialName,
          materials: foundMaterials
        });
      }
    }
    
    return matches;
  }

  // Calculate distance between two locations (simple approximation)
  static calculateDistance(userCity, supplierCity) {
    if (!userCity || !supplierCity) return 1000; // Default high distance
    
    const userLower = userCity.toLowerCase();
    const supplierLower = supplierCity.toLowerCase();
    
    // Same city/area check
    if (userLower.includes(supplierLower) || supplierLower.includes(userLower)) {
      return 10; // Same city
    }
    
    // Simple state/region matching
    const userWords = userLower.split(/[\s,]+/);
    const supplierWords = supplierLower.split(/[\s,]+/);
    
    for (const userWord of userWords) {
      for (const supplierWord of supplierWords) {
        if (userWord === supplierWord && userWord.length > 3) {
          return 50; // Same region/state
        }
      }
    }
    
    // Different regions
    return 200;
  }

  // Score and rank suppliers for a material
  static rankSuppliers(materials, userLocation) {
    // Calculate dynamic max price from current materials
    const maxPrice = Math.max(...materials.map(m => m.price), 100);
    
    return materials.map(material => {
      let score = 0;
      
      // Rating score (0-50 points)
      score += (material.ratings || 0) * 10;
      
      // Review count score (0-20 points)
      score += Math.min((material.numReviews || 0) * 2, 20);
      
      // Discount score (0-15 points)
      score += (material.discount || 0) * 0.15;
      
      // Price score (lower price = higher score, 0-10 points)
      score += (maxPrice - material.price) / maxPrice * 10;
      
      // Location proximity score (0-10 points)
      const distance = this.calculateDistance(
        userLocation, 
        material.createdBy?.businessAddress || ''
      );
      score += Math.max(0, 10 - (distance / 50));
      
      // Stock availability bonus (5 points if in stock)
      if (material.quantity > 0) score += 5;
      
      return {
        ...material,
        aiScore: Math.round(score * 100) / 100,
        distance: Math.round(distance),
        reasonForRecommendation: this.generateReason(material, distance)
      };
    }).sort((a, b) => b.aiScore - a.aiScore);
  }

  // Generate reason for recommendation
  static generateReason(material, distance) {
    const reasons = [];
    
    if (material.ratings >= 4) reasons.push('Highly rated');
    if (material.discount > 10) reasons.push(`${material.discount}% discount`);
    if (distance <= 20) reasons.push('Near your location');
    if (material.numReviews > 5) reasons.push('Well reviewed');
    if (material.quantity > 50) reasons.push('Good stock');
    
    return reasons.length > 0 ? reasons.join(', ') : 'Available';
  }

  // Main recommendation function
  static async getRecommendations(userInput, userLocation, allRawMaterials) {
    try {
      // Step 1: Extract material names using Gemini
      const materialNames = await this.extractRawMaterialNames(userInput);
      console.log('Extracted materials:', materialNames);
      
      // Step 2: Find matching materials
      const matches = await this.findMatchingMaterials(materialNames, allRawMaterials);
      console.log('Found matches:', matches.length);
      
      // Step 3: Rank and recommend best suppliers
      const recommendations = [];
      
      for (const match of matches) {
        const rankedMaterials = this.rankSuppliers(match.materials, userLocation);
        
        if (rankedMaterials.length > 0) {
          recommendations.push({
            searchTerm: match.searchTerm,
            recommendedMaterial: rankedMaterials[0], // Best match
            alternatives: rankedMaterials.slice(1, 3) // Top 2 alternatives
          });
        }
      }
      
      return {
        success: true,
        recommendations,
        totalFound: recommendations.length
      };
      
    } catch (error) {
      console.error('AI Recommendation error:', error);
      return {
        success: false,
        error: error.message,
        recommendations: []
      };
    }
  }
}