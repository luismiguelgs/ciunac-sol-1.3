'use client'
import React from 'react'
import { Card, CardContent } from './ui/card'
import { UseFormReturn } from 'react-hook-form'
import { isPdf } from '@/lib/utils'
import Image from 'next/image'
import { FileUploaderCard } from './forms/upload.field'
import { CloudUpload } from 'lucide-react'

type Props = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    field: string;
    label: string;
    dni: string;
    folder: 'dnis' | 'vouchers' | 'becas';
}

export default function UploadImage({form,field, label, dni, folder}:Props) 
{
    const toDrivePreview = (url?: string) => {
        if (!url) return url
        try{
            const u = new URL(url)
            if (u.hostname === 'drive.google.com'){
                // Patterns: /file/d/{id}/view or open?id={id}
                const match = u.pathname.match(/\/d\/([^/]+)\//)
                const id = match?.[1] || u.searchParams.get('id')
                if (id) return `https://drive.google.com/uc?export=view&id=${id}`
            }
        }catch{
            // ignore
        }
        return url
    }
    return (
        <div>
			<Card className='mb-2'>
				<CardContent className="flex justify-center items-center p-4">
				{
					form.watch(field) ? (
						<React.Fragment>
							{
                                isPdf(form.watch(field)) ? (
								    <Image
									    src={'/images/pdf.png'}
									    width={250}
									    height={250}
									    alt={label}
									    className="rounded-md object-contain h-[250px]"
								    />
							    ):(
									<Image
										src={toDrivePreview(form.watch(field)) ?? '/images/upload.svg'}
										width={250}
										height={250}
										alt={label}
										className="rounded-md object-contain h-[250px]"
									/>
								)
                            }
						</React.Fragment>
					):(
						<React.Fragment>
							<Image
								src={'/images/upload.svg'}
								width={250}
								height={250}
								alt={label}
								className="rounded-md object-contain h-[250px]"
							/>
						</React.Fragment>
					)
				}
				</CardContent>
			</Card>
			<FileUploaderCard
                name={field}
                label={label}
                dni={dni}
				folder={folder}
                icon={CloudUpload}
            />
		</div>
    )
}
