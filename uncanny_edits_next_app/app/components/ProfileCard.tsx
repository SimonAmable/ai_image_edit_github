"use client"

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ManageSubscriptionButton from "./ManageSubscriptionButton";
import { createClient } from "@/app/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import FeedbackButton from "./FeedbackButton";

const ProfileCard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<null | {
    avatar_url: string;
    name: string;
    email: string;
    is_pro: boolean;
  }>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // Fetch profile from 'profiles' table
      const { data: profileData } = await supabase
        .from("profiles")
        .select("avatar_url, name, email, is_pro")
        .eq("id", user.id)
        .single();
      setProfile({
        avatar_url: profileData?.avatar_url || "/logo.png",
        name: profileData?.name || user.email || "User",
        email: profileData?.email || user.email || "",
        is_pro: !!profileData?.is_pro,
      });
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Card className="max-w-md w-full mx-auto mt-8">
        <CardHeader className="flex flex-col items-center gap-2">
          <Skeleton className="w-20 h-20 rounded-full mb-2" />
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="max-w-md w-full mx-auto mt-8 text-center">
        <CardHeader>
          <CardTitle>Not signed in</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full mx-auto mt-8">
      <CardHeader className="flex flex-col items-center gap-2">
        <Avatar className="w-20 h-20 mb-2">
          <AvatarImage src={profile.avatar_url} alt={profile.name} />
          <AvatarFallback>{profile.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl font-bold">{profile.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{profile.email}</CardDescription>
      </CardHeader>
      <Separator className="my-2" />
      <CardContent className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Subscription Status:</span>
          <span className={profile.is_pro ? "text-green-600" : "text-yellow-600"}>
            {profile.is_pro ? "Pro" : "Free"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        {profile.is_pro && <ManageSubscriptionButton />}
        {!profile.is_pro && (
          <Button onClick={() => redirect('/pricing')}>Upgrade to Pro</Button>
        )}
        <FeedbackButton />
        <Button onClick={() => {
          const supabase = createClient()
          supabase.auth.signOut()
          redirect('/login')
        }}>
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;