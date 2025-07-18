import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext"; 
import type { Role } from "@/components/types"; 



interface LoginData {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface LoginErrors {
    email?: string;
    password?: string;
    general?: string;
}

interface LoginResponse {
    accessToken?: string; // ✅ cambió de token → accessToken
    user?: {
        id: string;
        name?: string;
        email: string;
        roles?: Role[];
    };
    message?: string;
    success?: boolean;
}


export default function Login() {

    const loginUrl = import.meta.env.VITE_LOGIN_URL;

    const navigate = useNavigate();
    const { login } = useAuth(); 

    const [formData, setFormData] = useState<LoginData>({
        email: "",
        password: "",
        rememberMe: false
    });

    const [errors, setErrors] = useState<LoginErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: LoginErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email) newErrors.email = "El correo es requerido";
        else if (!emailRegex.test(formData.email))
            newErrors.email = "Ingresa un correo válido";

        if (!formData.password) newErrors.password = "La contraseña es requerida";
        else if (formData.password.length < 6)
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        if (errors[name as keyof LoginErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${loginUrl}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const result: LoginResponse = await response.json();
            console.log("Respuesta del backend:", result);

            if (!response.ok || !result.accessToken) {
                throw new Error("Error al iniciar sesión");
            }

            if (!result.user) {
                throw new Error("No se recibió información del usuario");
            }
            if (result.user) {
                login(
                    result.accessToken,
                    { ...result.user, name: result.user.name ?? "", roles: result.user.roles ?? [] },
                    formData.rememberMe
                );
            }


            setIsSuccess(true);

            setTimeout(() => {
                navigate("/dashboard"); 
            }, 1000);
        } catch (error) {
            console.error("Error:", error);
            setErrors({
                general: error instanceof Error ? error.message : "Error al iniciar sesión"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        console.log("Redirect to forgot password page");
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-green-700 mb-2">¡Bienvenido!</h2>
                            <p className="text-gray-600 mb-4">
                                Has iniciado sesión correctamente. Serás redirigido al panel principal.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
                    <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.general && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.general}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="correo@ejemplo.com"
                                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Ingresa tu contraseña"
                                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))}
                                />
                                <Label
                                    htmlFor="rememberMe"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Recordarme
                                </Label>
                            </div>
                            <Button type="button" variant="link" className="px-0 font-normal text-sm" onClick={handleForgotPassword}>
                                ¿Olvidaste tu contraseña?
                            </Button>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </Button>


                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
