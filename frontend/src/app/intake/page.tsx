import { ArchitectDiscovery } from '@/components/ArchitectDiscovery';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function IntakePage() {
    return (
        <ProtectedRoute>
            <main className="min-h-screen pt-12 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <ArchitectDiscovery />
            </main>
        </ProtectedRoute>
    );
}
