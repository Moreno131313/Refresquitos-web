import InvoiceForm from '@/components/InvoiceForm'

export default function FacturaPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Generar Factura de Venta</h1>
      <InvoiceForm />
    </div>
  )
} 