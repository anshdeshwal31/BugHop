import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-64 " />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-64 " />
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-64 " />
          </div>
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-64 " />
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-64 " />
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-64 " />
          </div>
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-64 " />
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-64 " />
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-64 " />
          </div>
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-64 " />
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-64 " />
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-64 " />
          </div>
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-64 " />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
