import React from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const SettingsPage: React.FC = () => {
    // Temporary static data (replace later with Zustand or API)
    const user = {
        name: 'John Doe',
        email: 'john@example.com',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            {/* Profile Information */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <form className="space-y-4 max-w-lg">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                Name
                            </label>
                            <Input id="name" defaultValue={user.name} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <Input id="email" type="email" defaultValue={user.email} disabled />
                        </div>
                        <Button>Save Changes</Button>
                    </form>
                </div>
            </Card>

            {/* Change Password */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                    <form className="space-y-4 max-w-lg">
                        <div>
                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-300 mb-2">
                                Current Password
                            </label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                            </label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <Button>Update Password</Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;
