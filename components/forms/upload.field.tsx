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
import { validateVoucherFileMetadata } from "@/modules/shared/domain/voucher-file-policy";
import { uploadFile } from "@/services/storage.service";

interface FileUploaderCardProps {
  name: string;
  label?: string;
  icon: LucideIcon
  dni: string | undefined;
  folder: 'dnis' | 'vouchers' | 'becas';
  disabled?: boolean;
  accept?: string;
  validateFile?: (file: File) => string | null;
}

export const FileUploaderCard = ({
	name,
	label,
	icon: Icon,
	dni,
	folder,
	disabled = false,
	accept,
	validateFile,
}: FileUploaderCardProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const { control, setValue } = useFormContext();

	const handleFileSelect = () => {
		fileInputRef.current?.click();
	};

	const handleUpload = async (file: File, onChange: (url: string) => void) => {
		try{
			setUploadError(null);
			setUploading(true);
			setProgress(20);

			const customValidationError = validateFile?.(file);
			if (customValidationError) {
				setUploadError(customValidationError);
				return;
			}

			if (!validateFile && folder === 'becas' && file.type !== "application/pdf") {
				setUploadError("Solo se permiten archivos PDF.");
				return;
			}

			const voucherError = !validateFile && folder === 'vouchers' ? validateVoucherFileMetadata(file) : null;
			if (voucherError) {
				setUploadError(voucherError);
				return;
			}

			if (!validateFile && folder === 'dnis' && !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
				setUploadError("Solo se permiten archivos PDF, JPG y PNG.");
				return;
			}
			setProgress(40);
			const { viewLink, downloadLink } = await uploadFile(file, folder,dni,name);
			const isImage = file.type.startsWith('image/');
			const url = isImage ? viewLink : downloadLink;
			onChange(url);
			setValue(name, url);
			setProgress(100);
		} catch (cause) {
			setUploadError(cause instanceof Error ? cause.message : 'Error al subir archivo');
		} finally {
			setUploading(false);
		}
  	};

	const handleDisabled = ():boolean => {
		if (folder === 'dnis') {
		return disabled || uploading || String(dni).length < 8
		}else{
		return disabled || uploading
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
							accept={accept ?? (folder === 'becas' ? ".pdf" : ".pdf, .jpg, .jpeg, .png")}
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleUpload(file, onChange);
								e.target.value = '';
							}}
							className="hidden"
							disabled={disabled}
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
						{uploadError && <p className="text-sm text-red-600" role="alert">{uploadError}</p>}
					</CardContent>
				</Card>
			)}
		/>
	);
};
