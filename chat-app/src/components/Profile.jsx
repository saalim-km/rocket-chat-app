import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload, Mail, LogOut, Edit, AlertCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { setAvatar, updateOwnBasicInfo, sendVerificationEmail, logoutOtherClients } from '../services/rocketchat';

const Profile = () => {
  const { authToken, userId, user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load user data on mount/update
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setStatusMessage(user.statusText || '');
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setEmail(user.emails?.[0]?.address || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Clear messages after 5s
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const hasUsernameChanged = username !== (user?.username || '');

  const handleAvatarUpload = async () => {
    if (!avatarFile && !avatarUrl) return;
    setLoading(true);
    setError('');
    try {
      const result = avatarFile
        ? await setAvatar(avatarFile, authToken, userId, 'file')
        : await setAvatar(avatarUrl, authToken, userId, 'url');
      if (result.success) {
        updateUser({ ...user, avatarUrl: result.avatarUrl || avatarUrl });
        setSuccess('Avatar updated successfully');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    // Validate password if username changed
    if (hasUsernameChanged && !currentPassword) {
      setError('Current password is required to change username');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Build conditional payload - only changed fields
    const payload = {};
    if (name !== (user?.name || '')) payload.name = name;
    if (hasUsernameChanged) payload.username = username;
    if (statusMessage !== (user?.statusText || '')) payload.statusText = statusMessage;
    // COMMENTED: bio/nickname - require custom fields setup in admin
    // if (bio !== (user?.bio || '')) payload.bio = bio;
    // if (nickname !== (user?.nickname || '')) payload.nickname = nickname;
    if (hasUsernameChanged) payload.currentPassword = currentPassword;

    try {
      const result = await updateOwnBasicInfo(payload, authToken, userId);
      if (result.success) {
        // Update local user only with sent fields
        const updatedUser = { ...user };
        if (payload.name) updatedUser.name = name;
        if (payload.username) updatedUser.username = username;
        if (payload.statusText) updatedUser.statusText = statusMessage;
        // if (payload.bio) updatedUser.bio = bio;
        // if (payload.nickname) updatedUser.nickname = nickname;
        updateUser(updatedUser);
        setSuccess('Profile updated successfully');
        setCurrentPassword('');
        setShowPasswordInput(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.log(err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await sendVerificationEmail(authToken, userId);
      if (result.success) {
        setSuccess('Verification email resent successfully');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOther = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await logoutOtherClients(authToken, userId);
      if (result.success) {
        setSuccess('Logged out from other locations');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to logout from other locations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f2329] p-6">
      <Card className="bg-[#2f343d] border-0 shadow-lg max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatarUrl || "https://via.placeholder.com/64"} alt={username} />
              <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar" className="block text-sm font-medium text-gray-300 mb-1">
                Profile Picture
              </Label>
              <Input
                id="avatar"
                type="file"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="bg-[#1f2329] border-gray-700 text-white"
                accept="image/*"
              />
              <Input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Use URL for avatar"
                className="mt-2 bg-[#1f2329] border-gray-700 text-white"
              />
              <Button
                onClick={handleAvatarUpload}
                className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={loading || (!avatarFile && !avatarUrl)}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Avatar
              </Button>
            </div>
          </div>

          {/* Name and Username */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1f2329] border-gray-700 text-white"
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (hasUsernameChanged) setShowPasswordInput(true);
                }}
                className="bg-[#1f2329] border-gray-700 text-white"
                placeholder="Enter username"
              />
              {hasUsernameChanged && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Password required to confirm change
                </p>
              )}
            </div>
          </div>

          {/* Current Password Field (conditional) */}
          {showPasswordInput && (
            <div>
              <Label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Current Password (for username change)
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-[#1f2329] border-gray-700 text-white"
                placeholder="Enter current password"
              />
            </div>
          )}

          {/* Status Message */}
          <div>
            <Label htmlFor="statusMessage" className="block text-sm font-medium text-gray-300 mb-1">
              Status Message
            </Label>
            <Input
              id="statusMessage"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              className="bg-[#1f2329] border-gray-700 text-white"
              placeholder="What are you doing right now?"
            />
          </div>

          {/* Nickname */}
          <div>
            <Label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">
              Nickname
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-[#1f2329] border-gray-700 text-white"
              placeholder="Enter nickname"
            />
            <p className="text-xs text-gray-500 mt-1">Note: Requires custom fields setup in admin to save.</p>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-[#1f2329] border-gray-700 text-white"
              placeholder="Enter bio"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Note: Requires custom fields setup in admin to save.</p>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1f2329] border-gray-700 text-white flex-1"
                placeholder="Enter email"
              />
              <Button
                variant="secondary"
                onClick={handleResendVerification}
                className="bg-gray-700 hover:bg-gray-600"
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" /> Resend Verification
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handleUpdateProfile}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={loading || (hasUsernameChanged && !currentPassword)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update Profile
          </Button>
          <Button
            variant="secondary"
            onClick={handleLogoutOther}
            className="bg-gray-700 hover:bg-gray-600"
            disabled={loading}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout from Other Locations
          </Button>
        </CardFooter>
      </Card>
      {success && <p className="mt-4 text-emerald-400">{success}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
};

export default Profile;