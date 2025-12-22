// components/FileUploaderCard.tsx
"use client";

import { useRef, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, Upload } from "lucide-react";
import { uploadFile } from "@/services/storage.service";

interface FileUploaderCardProps {
  name: string;
  label?: string;
  icon: LucideIcon
  dni: string | undefined;
  folder: 'dnis' | 'vouchers' | 'becas';
}

export const FileUploaderCard = ({ name, label, icon:Icon, dni, folder }: FileUploaderCardProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const { control, setValue } = useFormContext();

	const handleFileSelect = () => {
		fileInputRef.current?.click();
	};

	const handleUpload = async (file: File, onChange: (url: string) => void) => {
		try{
			setUploading(true);
			setProgress(20);

			if (folder === 'becas' && file.type !== "application/pdf") {
				alert("Solo se permiten archivos PDF.");
				return;
			}

			if (folder !== 'becas' && !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
				alert("Solo se permiten archivos PDF, JPG y PNG.");
				return;
			}
			setProgress(40);
			const { viewLink, downloadLink } = await uploadFile(file, folder,dni,name);
			const isImage = file.type.startsWith('image/');
			const url = isImage ? viewLink : downloadLink;
			onChange(url);
			setValue(name, url);
			setProgress(100);
		} catch (err) {
			console.error('Error al subir archivo:', err);
			alert('Error al subir archivo');
		} finally {
			setUploading(false);
		}
  	};

	const handleDisabled = ():boolean => {
		if (folder === 'dnis') {
		return uploading || String(dni).length < 8
		}else{
		return uploading
		}
	}

	return (
    	<Controller
			control={control}
			name={name}
			render={({ field: { value, onChange }, fieldState: { error } }) => (
				<Card className="w-full">
				{(label) && (
					<CardHeader className="flex flex-row items-center gap-2">
					{Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
					<CardTitle className="text-base">{label}</CardTitle>
					</CardHeader>
				)}
					<CardContent className="flex flex-col gap-1">
						<input
							type="file"
							ref={fileInputRef}
							accept={folder === 'becas' ? ".pdf" : ".pdf, .jpg, .jpeg, .png"}
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleUpload(file, onChange);
							}}
							className="hidden"
						/>

						<Button type="button" onClick={handleFileSelect} disabled={handleDisabled()}>
							<Upload className="w-4 h-4 mr-2" />
							{uploading ? "Subiendo..." : value ? "Reemplazar documento" : "Subir documento"}
						</Button>

						{uploading && <Progress value={progress} className="h-2" />}

						{value && !uploading && (
							<p className="text-sm text-green-600">
								Archivo cargado:{" "}
								<a href={value} target="_blank" className="underline" rel="noopener noreferrer">
								Ver archivo
								</a>
							</p>
						)}

						{error && <p className="text-sm text-red-600">{error.message}</p>}
					</CardContent>
				</Card>
			)}
		/>
	);
};
