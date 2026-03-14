"use client";

import { useState, useEffect, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Fade from "@mui/material/Fade";
import { alpha } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";
import {
    Lock,
    Fingerprint,
    X,
    Shield,
    LayoutGrid,
    KeyRound
} from "lucide-react";
import { ecosystemSecurity } from "@/lib/ecosystem/security";
import { AppwriteService } from "@/lib/appwrite";
import { useAuth } from "@/context/auth/AuthContext";
import toast from "react-hot-toast";
import { unlockWithPasskey } from "@/lib/passkey";
import { PasskeySetup } from "./PasskeySetup";
import { useRouter } from "next/navigation";

interface SudoModalProps {
    isOpen: boolean;
    onSuccess: () => void;
    onCancel: () => void;
    intent?: "unlock" | "initialize" | "reset";
}

export default function SudoModal({
    isOpen,
    onSuccess,
    onCancel,
    intent,
}: SudoModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [passkeyLoading, setPasskeyLoading] = useState(false);
    const [hasPasskey, setHasPasskey] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    const [mode, setMode] = useState<"passkey" | "password" | "pin" | "initialize" | null>(null);
    const [isDetecting, setIsDetecting] = useState(true);
    const [showPasskeyIncentive, setShowPasskeyIncentive] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [otp, setOtp] = useState("");

    const handleSuccessWithSync = useCallback(async () => {
        if (user?.$id) {
            try {
                // Sudo Hook: Ensure E2E Identity is created and published upon successful MasterPass unlock
                console.log("Synchronizing Identity...");
                await ecosystemSecurity.ensureE2EIdentity(user.$id);
                
                // Incentive: If user doesn't have a passkey, show incentive (7-day snooze)
                const entries = await AppwriteService.listKeychainEntries(user.$id);
                const hasPasskey = entries.some((e: any) => e.type === 'passkey');
                
                if (!hasPasskey) {
                    const lastSkip = localStorage.getItem(`passkey_skip_${user.$id}`);
                    const sevenDays = 7 * 24 * 60 * 60 * 1000;
                    if (!lastSkip || (Date.now() - parseInt(lastSkip)) > sevenDays) {
                        setShowPasskeyIncentive(true);
                        return; // Don't call onSuccess yet, PasskeySetup will handle it
                    }
                }
            } catch (e) {
                console.error("Failed to sync identity on unlock", e);
            }
        }
        onSuccess();
    }, [user?.$id, onSuccess]);

    const handlePasswordVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!password || !user?.$id) return;

        setLoading(true);
        try {
            const entries = await AppwriteService.listKeychainEntries(user.$id);
            const entry = entries.find((e: any) => e.type === 'password');

            if (!entry) {
                toast.error("Security profile corrupted");
                return;
            }

            const success = await ecosystemSecurity.unlock(password, entry);
            if (success) {
                toast.success("Identity Verified");
                handleSuccessWithSync();
            } else {
                toast.error("Incorrect Master Password");
            }
        } catch (_e: unknown) {
            toast.error("Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePinVerify = async () => {
        if (pin.length !== 4) return;
        setLoading(true);
        try {
            const success = await ecosystemSecurity.unlockWithPin(pin);
            if (success) {
                toast.success("Unlocked with PIN");
                handleSuccessWithSync();
            } else {
                toast.error("Incorrect PIN");
                setPin("");
            }
        } catch (_e: unknown) {
            toast.error("PIN verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !user?.$id) return;

        setLoading(true);
        try {
            // 1. Generate new MEK
            const mek = await ecosystemSecurity.generateRandomMEK();
            
            // 2. Derive salt and wrap MEK
            const salt = crypto.getRandomValues(new Uint8Array(32));
            const wrappedKey = await ecosystemSecurity.wrapMEK(mek, password, salt);
            
            // 3. Save to Appwrite
            await AppwriteService.createKeychainEntry({
                userId: user.$id,
                type: 'password',
                wrappedKey,
                salt: btoa(String.fromCharCode(...salt)),
                createdAt: new Date().toISOString()
            });

            // 4. Update user flag in database
            await AppwriteService.setMasterpassFlag(user.$id, user.email || '');

            // 5. Unlock locally
            const rawMek = await crypto.subtle.exportKey("raw", mek);
            await ecosystemSecurity.importMasterKey(rawMek);

            toast.success("MasterPass Initialized");
            handleSuccessWithSync();
        } catch (_e: unknown) {
            console.error(_e);
            toast.error("Initialization failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePasskeyVerify = useCallback(async () => {
        if (!user?.$id || !isOpen) return;
        setPasskeyLoading(true);
        try {
            const success = await unlockWithPasskey(user.$id);
            if (success && isOpen) {
                toast.success("Verified via Passkey");
                handleSuccessWithSync();
            }
        } catch (e) {
            console.error("Passkey verification failed or cancelled", e);
        } finally {
            setPasskeyLoading(false);
        }
    }, [user?.$id, isOpen, handleSuccessWithSync]);

    // Check if user has passkey and PIN set up
    useEffect(() => {
        if (isOpen && user?.$id) {
            const pinSet = ecosystemSecurity.isPinSet();
            setHasPin(pinSet);

            // Check for passkey keychain entry
            AppwriteService.listKeychainEntries(user.$id).then(entries => {
                const passkeyPresent = entries.some((e: any) => e.type === 'passkey');
                const passwordPresent = entries.some((e: any) => e.type === 'password');
                const pinPresent = entries.some((e: any) => e.type === 'pin') || pinSet;
                
                setHasPasskey(passkeyPresent);
                setHasPin(pinPresent);

                // Intent Logic: Setup vs Unlock
                if (intent === "initialize") {
                    if (passwordPresent) {
                        toast.error("MasterPass is already setup. Use reset if needed.");
                        setMode("password");
                    } else {
                        setMode("initialize");
                    }
                    setIsDetecting(false);
                    return;
                }

                if (intent === "reset") {
                    setIsResetting(true);
                    setMode(passkeyPresent ? "passkey" : "password"); // Use passkey if available for reset
                    setIsDetecting(false);
                    return;
                }

                // Enforce Master Password setup if missing
                if (!passwordPresent && isOpen) {
                    setMode("initialize");
                    setIsDetecting(false);
                    return;
                }

                if (passkeyPresent) {
                    setMode("passkey");
                    handlePasskeyVerify();
                } else if (pinPresent) {
                    setMode("pin");
                } else {
                    setMode("password");
                }
                setIsDetecting(false);
            }).catch(() => {
                setIsDetecting(false);
                setMode("password");
            });

            // Reset state on open
            setPassword("");
            setPin("");
            setLoading(false);
            setPasskeyLoading(false);
            setIsDetecting(true);
        }
    }, [isOpen, user, handlePasskeyVerify, onCancel, router]);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setPin(val);
        if (val.length === 4) {
            handlePinVerify();
        }
    };

    if (showPasskeyIncentive && user) {
        return (
            <PasskeySetup
                isOpen={true}
                onClose={() => {
                    setShowPasskeyIncentive(false);
                    handleSuccessWithSync();
                }}
                userId={user.$id}
                onSuccess={() => {
                    setShowPasskeyIncentive(false);
                    handleSuccessWithSync();
                }}
                trustUnlocked={true}
            />
        );
    }

    return (
        <Dialog
            open={isOpen}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    borderRadius: '28px',
                    bgcolor: 'rgba(10, 10, 10, 0.95)',
                    backdropFilter: 'blur(25px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundImage: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1, position: 'relative' }}>
                <IconButton
                    onClick={onCancel}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
                    }}
                >
                    <X size={20} />
                </IconButton>

                <Box sx={{
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: '16px',
                    bgcolor: alpha('#00F0FF', 0.1),
                    color: '#00F0FF',
                    mb: 2
                }}>
                    <Shield size={32} />
                </Box>
                <Typography variant="h5" sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    fontFamily: 'var(--font-space-grotesk)',
                    color: 'white'
                }}>
                    Security Check
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                    Please verify your identity to continue in Flow
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pb: 4 }}>
                {isDetecting || passkeyLoading ? (
                    <Stack spacing={3} sx={{ mt: 4, mb: 2, alignItems: 'center' }}>
                        <CircularProgress size={48} sx={{ color: '#00F0FF' }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: '0.1em' }}>
                                {passkeyLoading ? "AUTHENTICATING..." : "PREPARING SECURITY CHECK..."}
                            </Typography>
                            {passkeyLoading && (
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', mt: 1, display: 'block' }}>
                                    Please confirm on your device
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                ) : mode === "pin" ? (
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, mb: 1, display: 'block', textAlign: 'center' }}>
                                ENTER 4-DIGIT PIN
                            </Typography>
                            <TextField
                                fullWidth
                                type="password"
                                placeholder="••••"
                                value={pin}
                                onChange={handlePinChange}
                                autoFocus
                                inputProps={{
                                    maxLength: 4,
                                    inputMode: 'numeric',
                                    style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5em' }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LayoutGrid size={18} color="rgba(255, 255, 255, 0.3)" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '14px',
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                        '&.Mui-focused fieldset': { borderColor: '#00F0FF' },
                                    },
                                    '& .MuiInputBase-input': { color: 'white' }
                                }}
                            />
                        </Box>

                        <Box sx={{ width: '100%', position: 'relative', py: 1 }}>
                            <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                            <Typography variant="caption" sx={{
                                position: 'relative',
                                bgcolor: 'rgba(10, 10, 10, 1)',
                                px: 2,
                                mx: 'auto',
                                display: 'table',
                                color: 'rgba(255, 255, 255, 0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Or
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="text"
                            size="small"
                            onClick={() => setMode("password")}
                            sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'white' } }}
                        >
                            Use Master Password
                        </Button>
                    </Stack>
                ) : mode === "initialize" ? (
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <Box sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: alpha('#FF9500', 0.1),
                            border: '1px solid rgba(255, 149, 0, 0.2)',
                        }}>
                            <Typography variant="body2" sx={{ color: '#FF9500', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <KeyRound size={16} /> Setup Required
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5, display: 'block' }}>
                                You need to create a MasterPass to secure your Flow workspace.
                            </Typography>
                        </Box>

                        <form onSubmit={handleInitialize}>
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, mb: 1, display: 'block' }}>
                                        NEW MASTER PASSWORD
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock size={18} color="rgba(255, 255, 255, 0.3)" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '14px',
                                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#00F0FF' },
                                            },
                                            '& .MuiInputBase-input': { color: 'white' }
                                        }}
                                    />
                                </Box>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !password || password.length < 8}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: '14px',
                                        bgcolor: '#00F0FF',
                                        color: '#000',
                                        fontWeight: 700,
                                        '&:hover': {
                                            bgcolor: alpha('#00F0FF', 0.8),
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: alpha('#00F0FF', 0.1),
                                            color: 'rgba(255, 255, 255, 0.3)'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Initialize MasterPass"}
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                ) : mode === "passkey" ? (
                    <Stack spacing={3} sx={{ mt: 2, alignItems: 'center' }}>
                        <Box
                            onClick={handlePasskeyVerify}
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                border: '2px dashed',
                                borderColor: passkeyLoading ? '#00F0FF' : 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                animation: passkeyLoading ? 'pulse 2s infinite' : 'none',
                                '&:hover': {
                                    borderColor: '#00F0FF',
                                    bgcolor: alpha('#00F0FF', 0.05)
                                }
                            }}
                        >
                            <Fingerprint size={40} color={passkeyLoading ? '#00F0FF' : 'rgba(255, 255, 255, 0.4)'} />
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                Use Face ID / Touch ID
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                Authenticate with your device security
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handlePasskeyVerify}
                            disabled={passkeyLoading}
                            sx={{
                                py: 1.5,
                                borderRadius: '14px',
                                bgcolor: '#00F0FF',
                                color: '#000',
                                fontWeight: 700,
                                '&:hover': {
                                    bgcolor: alpha('#00F0FF', 0.8),
                                },
                                '&.Mui-disabled': {
                                    bgcolor: alpha('#00F0FF', 0.1),
                                    color: 'rgba(255, 255, 255, 0.3)'
                                }
                            }}
                        >
                            {passkeyLoading ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress size={20} color="inherit" />
                                    <span>Waiting for Passkey...</span>
                                </Stack>
                            ) : "Verify with Passkey"}
                        </Button>

                        <Box sx={{ width: '100%', position: 'relative', py: 1 }}>
                            <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                            <Typography variant="caption" sx={{
                                position: 'relative',
                                bgcolor: 'rgba(10, 10, 10, 1)',
                                px: 2,
                                mx: 'auto',
                                display: 'table',
                                color: 'rgba(255, 255, 255, 0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Or
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="text"
                            size="small"
                            onClick={() => setMode("password")}
                            sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'white' } }}
                        >
                            Use Master Password
                        </Button>
                    </Stack>
                ) : (
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <form onSubmit={handlePasswordVerify}>
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, mb: 1, display: 'block' }}>
                                        MASTER PASSWORD
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="Enter your master password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock size={18} color="rgba(255, 255, 255, 0.3)" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '14px',
                                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#00F0FF' },
                                            },
                                            '& .MuiInputBase-input': { color: 'white' }
                                        }}
                                    />
                                </Box>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !password}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: '14px',
                                        bgcolor: '#00F0FF',
                                        color: '#000',
                                        fontWeight: 700,
                                        '&:hover': {
                                            bgcolor: alpha('#00F0FF', 0.8),
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 8px 20px rgba(0, 240, 255, 0.3)'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm Password"}
                                </Button>
                            </Stack>
                        </form>

                        {(hasPasskey || hasPin) && (
                            <Box sx={{ width: '100%', position: 'relative', py: 1 }}>
                                <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                                <Typography variant="caption" sx={{
                                    position: 'relative',
                                    bgcolor: 'rgba(10, 10, 10, 1)',
                                    px: 2,
                                    mx: 'auto',
                                    display: 'table',
                                    color: 'rgba(255, 255, 255, 0.3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Or
                                </Typography>
                            </Box>
                        )}

                        {hasPasskey && (
                            <Button
                                fullWidth
                                variant="text"
                                startIcon={<Fingerprint size={18} />}
                                onClick={() => setMode("passkey")}
                                sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'white' } }}
                            >
                                Use Passkey
                            </Button>
                        )}

                        {hasPin && (
                            <Button
                                fullWidth
                                variant="text"
                                startIcon={<LayoutGrid size={18} />}
                                onClick={() => setMode("pin")}
                                sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'white' } }}
                            >
                                Use PIN
                            </Button>
                        )}
                    </Stack>
                )
                }
            </DialogContent>
        </Dialog>
    );
}
