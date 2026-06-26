export interface ActiveAlert {
  id?: string
  distrito: string
  nivel: 'naranja' | 'rojo' | 'amarillo'
  fuente: string
  vigencia_desde?: string
  vigencia_hasta?: string
}
