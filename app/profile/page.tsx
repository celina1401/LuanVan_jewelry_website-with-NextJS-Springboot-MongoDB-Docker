import { UserRoleDisplay } from '../components/UserRoleDisplay';

export default function ProfilePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>
            <UserRoleDisplay />
        </div>
    );
} 