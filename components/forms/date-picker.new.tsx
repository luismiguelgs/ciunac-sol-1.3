"use client"

import * as React from "react"
import { format, getMonth, getYear, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Control } from "react-hook-form"

interface DatePickerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    name: string
    label: string
    description?: string
    startYear?: number
    endYear?: number
    disabled?: boolean
}

export function DatePicker({
	control,
	name,
  disabled = false,
	label,
	description,
	startYear = getYear(new Date()) - 80,
	endYear = getYear(new Date()) + 0,
}: DatePickerProps) {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  )

  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [open, setOpen] = React.useState(false)

  return (
	<div className="mt-2">
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col min-h-[70px]">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Popover
              open={open}
              onOpenChange={(v) => {
                setOpen(v)
                if (v) {
                  setCurrentMonth(field.value || new Date())
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  disabled={disabled}
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="flex justify-between p-2">
                  <Select
                    onValueChange={(month) => {
                      const base = field.value || currentMonth || new Date()
                      const newDate = setMonth(base, months.indexOf(month))
                      setCurrentMonth(newDate)
                      field.onChange(newDate)
                    }}
                    value={months[getMonth(currentMonth)]}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(year) => {
                      const base = field.value || currentMonth || new Date()
                      const newDate = setYear(base, parseInt(year))
                      setCurrentMonth(newDate)
                      field.onChange(newDate)
                    }}
                    value={getYear(currentMonth).toString()}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    if (date) setCurrentMonth(date)
                    field.onChange(date)
                  }}
                  onMonthChange={setCurrentMonth}
                  month={currentMonth}
                  initialFocus
				  //weekStartsOn={0}
                  locale={es}
                />

              </PopoverContent>
            </Popover>
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
	</div>
  )
}