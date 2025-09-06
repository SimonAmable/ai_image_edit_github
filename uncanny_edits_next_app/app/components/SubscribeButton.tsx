'use client'
import React, { useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Props = {
    priceId: string;
    userId: string;
}

const SubscribeButton = ({ priceId, userId }: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleClickSubscribe = async () => {
        startTransition(async () => {
            try {
                const response = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ priceId, userId }),
                });
                const data = await response.json();
                if (data.url) {
                    // Redirect to Stripe Checkout
                    window.location.href = data.url;
                } else {
                    toast.error('Something went wrong');
                    console.log('Subscribe response:', data);
                }
            } catch (error) {
                toast.error('Something went wrong');
                console.error('Subscribe error:', error);
            }
        });
    }

    return (
        <Button className="w-full bg-background text-foreground" variant="outline"  disabled={isPending} onClick={handleClickSubscribe}>
            Subscribe
        </Button>
    )
}

export default SubscribeButton