import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const AgentCardSkeleton = () => {
  return (
    <Card className="border-zinc-700 bg-zinc-800 overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Skeleton className="w-8 h-8 rounded-full mr-2" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-0 grow">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  );
};

export default AgentCardSkeleton;
