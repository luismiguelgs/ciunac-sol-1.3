import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import React from "react";

type Props = {
    title: string;
    description: React.ReactNode | string;
    type?: 'success' | 'error' | 'warning' | 'info'
}

export default function MyAlert({title, description, type='info'}: Props) {
    switch (type) {
        case 'success':
            return (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">{title}</AlertTitle>
                        <AlertDescription className="text-1xl text-green-700">
                            {description}
                        </AlertDescription>
                    </Alert>
            ) 
        case 'error':
            return (
                    <Alert className="mt-4 bg-red-50 border-red-200">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">{title}</AlertTitle>
                        <AlertDescription className="text-1xl text-red-700">
                            {description}
                        </AlertDescription>
                    </Alert>  
            )
        case'warning':
            return (
                    <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">{title}</AlertTitle>
                        <AlertDescription className="text-1xl text-yellow-700">
                            {description}
                        </AlertDescription>
                    </Alert>  
            )
        default:
            return (
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">{title}</AlertTitle>
                    <AlertDescription className="text-1xl text-blue-700">
                        {description}
                    </AlertDescription>
                </Alert>
            
        )
    }
    
}
