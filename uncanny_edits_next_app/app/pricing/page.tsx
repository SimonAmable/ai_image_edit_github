import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { createClient } from '@/app/utils/supabase/server';
import SubscribeButton from '../components/SubscribeButton';

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    bg: "bg-card",
    text: "text-foreground",
    features: [
      "Limited Flux image generations",
      "Basic Flux Kontext image editing",
    ],
    isFree: true,
  },
  {
    name: "Basic",
    price: "$5",
    oldPrice: "$10",
    period: "/month",
    bg: "bg-card",
    text: "text-foreground",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_MONTLY as string,
    features: [
      "1,000+ Flux image generations/month",
      "Loads of Flux Kontext Pro image editing",
      "Access to GPT image model",
    ],
  },
  {
    name: "Pro",
    price: "$20",
    oldPrice: "$30",
    period: "/month",
    bg: "bg-card",
    text: "text-foreground",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTLY as string,
    features: [
      "5,000+ Flux image generations/month",
      "Nearly unlimited Flux Kontext Pro image editing",
      "Access to GPT image model",
    ],
  },
];

export default async function Pricing() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  return (
    <div className="flex flex-col items-center h-[80vh] bg-background py-4">
      <div className="flex flex-col items-center justify-center py-6  ">
        <h1 className="text-4xl lg:text-5xl text-center text-foreground font-bold mb-2">Pick your plan</h1>
        <p className="text-lg text-center text-muted-foreground py-8">Choose the plan that fits your needs.</p>
      </div>
      <div className="flex gap-8 flex-wrap justify-center">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`w-80 rounded-2xl shadow-2xl flex flex-col items-center p-0 border-0 ${plan.bg} ${plan.text}`}
          >
            <CardHeader className="w-full flex flex-col items-center bg-transparent px-8 pt-8 pb-0">
              <CardTitle className="text-3xl font-bold mb-2 text-center w-full">{plan.name}</CardTitle>
              <div className="flex items-end mb-2">
                {plan.oldPrice && (
                  <span className="text-lg line-through text-muted-foreground mr-2">{plan.oldPrice}</span>
                )}
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="ml-1 text-base text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="w-full px-8 py-0">
              <ul className="my-6 w-full">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center mb-2">
                    <Check className="mr-2 text-green-300 w-5 h-5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="w-full px-8 pb-8 pt-0 mt-auto">
              {plan.isFree ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <SubscribeButton priceId={plan.priceId ?? ''} userId={userId ?? ''} />
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
