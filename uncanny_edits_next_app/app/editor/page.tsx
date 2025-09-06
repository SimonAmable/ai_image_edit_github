
import { InfiniteCanvas } from "@/app/components/infinite-canvas"
import { SetupInstructions } from "@/app/components/setup-instructions"

export default function ImageEditor() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-muted/20">
            <InfiniteCanvas />

            {/* Show setup instructions if Google Cloud is not configured
      {!process.env.GOOGLE_CLOUD_PROJECT_ID && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <SetupInstructions />
        </div>
      )} */}
        </div>
    )
}
