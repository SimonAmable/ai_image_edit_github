"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { AlertCircle, ExternalLink } from "lucide-react"

export function SetupInstructions() {
    return (
        <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Google Cloud Setup Required
                </CardTitle>
                <CardDescription>
                    To use the image editing features, you need to configure Google Vertex AI Imagen API
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Required Environment Variables:</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">GOOGLE_CLOUD_PROJECT_ID</Badge>
                            <span className="text-sm text-muted-foreground">Your Google Cloud Project ID</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">GOOGLE_CLOUD_ACCESS_TOKEN</Badge>
                            <span className="text-sm text-muted-foreground">Service account access token</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">GOOGLE_CLOUD_LOCATION</Badge>
                            <span className="text-sm text-muted-foreground">Optional (defaults to us-central1)</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Setup Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Create a Google Cloud Project</li>
                        <li>Enable the Vertex AI API</li>
                        <li>Create a service account with Vertex AI permissions</li>
                        <li>Generate an access token or use Application Default Credentials</li>
                        <li>Add the environment variables to your Vercel project</li>
                    </ol>
                </div>

                <div className="pt-2">
                    <a
                        href="https://cloud.google.com/vertex-ai/docs/authentication"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                        View Google Cloud Documentation
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </CardContent>
        </Card>
    )
}
