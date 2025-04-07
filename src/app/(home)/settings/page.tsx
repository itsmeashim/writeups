import { Button } from "~/components/ui/button"

import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import SettingsTemplate from "../../../modules/settings/templates"

export default function SettingsPage() {
  return (
    <div className='container mx-auto my-10'>
      <Button variant='outline' icon={<ArrowLeftIcon />} className='mb-2'>
        <Link href='/'>Back</Link>
      </Button>
      <SettingsTemplate />
    </div>
  )
}
