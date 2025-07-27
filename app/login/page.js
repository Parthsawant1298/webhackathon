import Login from '@/components/Login';
import { Suspense } from 'react';

export default function LoginPage() {
    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <Login />
            </Suspense>
        </main>
    );
}