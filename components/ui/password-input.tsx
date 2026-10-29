"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function PasswordInput(props: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [shown, setShown] = React.useState(false)
  return (
    <div className="relative">
      <Input {...props} type={shown ? "text" : "password"} className="pr-14" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={shown ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={shown}
        onClick={() => setShown((s) => !s)}
        className="absolute right-1 top-1/2 -translate-y-1/2"
      >
        {shown ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      </Button>
    </div>
  )
}

export { PasswordInput }
