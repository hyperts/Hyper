
export type ConfigTable = {
  [key: string]: ConfigCategory
}

export type ConfigCategory = {
  name: string
  items: {
      [key: string] : ConfigItem
  }
}

export type ConfigItem = {
    name: string
    description: string,
    icon: string
    fields: {
        [key: string]: ConfigField
    }
}

export type ConfigField = {
  name: string
  description: string
  value: boolean | number | string
} & ({ 
  type: "selection"
  options: string[]
} | {
  type: "checkbox" | "number" | "color" | "text"
  options?: string[]
})

export type HSWWData = {

} &  {
  Event: "window.opened"
  ProcessId: number
  Name: string
  WindowHandle: string
} | {
  Event: "window.opened"
  ProcessId: number
  Name: string
  WindowHandle: string
} | {
  Event: "window.renamed"
  ProcessId: number
  Name: string
  WindowHandle: string
} | {
  Event: "WindowList"
  Handle: number
  Title: string
  ProcessId: number
  ProcessName: string
}