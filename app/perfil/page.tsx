"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { UserIcon, Mail, Lock, LogOut } from "lucide-react"

export default function ProfilePage() {


  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
        </div>

        {/* Profile Information */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserIcon size={24} />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fname">First Name</Label>
                  <Input id="fname" defaultValue="John" placeholder="First name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname">Last Name</Label>
                  <Input id="lname" defaultValue="Doe" placeholder="Last name" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </Label>
                <Input id="email" type="email" defaultValue="john@example.com" placeholder="your@email.com" />
              </div>

              <Button>Update Profile</Button>
            </div>
          </div>
        </Card>

        {/* Password */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock size={24} />
              Password
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pwd">Current Password</Label>
                <Input id="current-pwd" type="password" placeholder="••••••••" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pwd">New Password</Label>
                  <Input id="new-pwd" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pwd">Confirm Password</Label>
                  <Input id="confirm-pwd" type="password" placeholder="••••••••" />
                </div>
              </div>

              <Button>Change Password</Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" className="gap-2">
            <LogOut size={16} />
            Sign Out
          </Button>
        </Card>
      </div>
    </AppLayout>
  )
}
