import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <Card className="max-w-xl">
        <CardContent className="space-y-4 p-6 text-center">
          <p className="text-2xl font-semibold">Ruta no encontrada</p>
          <p className="text-stone-500">La página solicitada no existe dentro de AgroCopilot AI.</p>
          <Button asChild><Link to="/dashboard">Volver al dashboard</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
