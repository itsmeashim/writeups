import PasswordForm from "../form/password";

export function PasswordSection() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Password</h3>
        <p className="text-sm text-muted-foreground">
          Update your password to keep your account secure.
        </p>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
