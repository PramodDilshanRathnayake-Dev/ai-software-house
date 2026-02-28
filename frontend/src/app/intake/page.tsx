import { IntakeChat } from '@/components/IntakeChat';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function IntakePage() {
    return (
        <ProtectedRoute>
            <main className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <IntakeChat />
            </main>
        </ProtectedRoute>
    );
}
