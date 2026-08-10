'use client'

import { Control } from 'react-hook-form'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getIconByCode } from '@/components/icons/flags'
import { NewStudentProgramOption } from '@/modules/solicitud-nuevo/domain/new-student'
import { IBasicInfoSchema } from '@/modules/solicitud-nuevo/schemas/basic-info.schema'

type Props = {
  control: Control<IBasicInfoSchema>
  programs: NewStudentProgramOption[]
}

export default function ProgramSelect({ control, programs }: Props) {
  return (
    <FormField
      control={control}
      name="code_program"
      render={({ field }) => (
        <FormItem className="min-h-[70px]">
          <FormLabel>Programa</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona un programa" /></SelectTrigger>
            </FormControl>
            <SelectContent className="w-full min-w-[300px]">
              {programs.map((program) => (
                <SelectItem key={program.code} value={program.code} className="py-2">
                  <div className="flex w-full items-center gap-3 pl-0.5">
                    <div className="flex h-7 w-7 flex-shrink-0 origin-center scale-150 items-center justify-center">
                      {getIconByCode(program.code)}
                    </div>
                    <span className="flex-1">{program.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>Selecciona el idioma o programa.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
