import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { EmailSection } from "../sections/email"
import { PasswordSection } from "../sections/password"
import { ProfileSection } from "../sections/profile"

export default function SettingsTemplate() {
  return (
    <div className='flex flex-col gap-6'>
      <Card className='shadow-none'>
        <CardHeader>
          <CardTitle className='text-xl font-bold'>
            Update your profile
          </CardTitle>
          <CardDescription>
            Update your name, email, and username to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSection />
          <Separator className='my-6' />
          <EmailSection />
          <Separator className='my-6' />
          <PasswordSection />
        </CardContent>
      </Card>
    </div>
  )
}
