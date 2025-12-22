
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const cards = [
  {
    title: 'Solicitud de Certificados',
    image: 'https://images.pexels.com/photos/27001883/pexels-photo-27001883/free-photo-of-ciudad-carretera-trafico-gente.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/solicitud-certificados',
    content: 'Rellena el formulario con los datos y requisitos correctos. Recogerás presencialmente tu certificado luego de 10 días hábiles'
  },
  {
    title: 'Solicitud de Examen de Ubicación',
    image: 'https://images.pexels.com/photos/7377687/pexels-photo-7377687.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/solicitud-ubicacion',
    content: 'Rellena el formulario con los datos y requisitos correctos. Podrás rendir el examen en la fecha publicada en la web'
  },
  {
    title: 'Consulta Estado de Solicitud',
    image: 'https://images.pexels.com/photos/19593823/pexels-photo-19593823/free-photo-of-paisaje-naturaleza-nubes-bosque.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/consulta-solicitud',
    content: 'Ingresa tu DNI y verifica si ya está listo para recoger tu certificado de manera presencial con tu cargo'
  },
  {
    title: 'Consulta de Certificado',
    image: 'https://images.pexels.com/photos/14035701/pexels-photo-14035701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/consulta-certificado',
    content: 'App que puede visualizar el detalle de tu certificado en la página web CIUNAC, se usa un código QR para verificar el certificado'
  },
  {
    title: 'Solicitud alumno nuevo',
    image: 'https://images.pexels.com/photos/7175572/pexels-photo-7175572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/solicitud-nuevo',
    content: 'Rellena el formulario con los datoscorrectos. Verifica tu correo electrónico para seguir con la matrícula'
  },
  {
    title: 'Consulta de Examen de Ubicación',
    image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/consulta-ubicacion',
    content: 'Ingresa tu DNI y verifica tu nivel de ubicación. Podrás descargar también tu constancia de ubicación'
  },
  {
    title: 'Solicitud de BECA CIUNAC',
    image: 'https://images.pexels.com/photos/27001883/pexels-photo-27001883/free-photo-of-ciudad-carretera-trafico-gente.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/solicitud-beca',
    content: 'Ingresa tus datos y requisitos para solicitar tu beca'
  },
];
export default function Home() {
  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {
        cards.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={card.image}
                  alt={card.title}
                  priority
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <p>{card.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild>
                <Link href={card.link}>Ir a {card.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))
      }
    </div>
  )
}
