import { Skeleton } from "./ui/skeleton"

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <Skeleton className="h-48 w-full mb-4" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2 mb-3" />
    <Skeleton className="h-6 w-1/4" />
  </div>
)

export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    <div className="flex justify-between items-start mb-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-6 w-20" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3 mb-3" />
    <Skeleton className="h-5 w-1/4" />
  </div>
)

export const TableRowSkeleton = () => (
  <tr>
    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
    <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
  </tr>
)

export const DashboardCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-4 w-24" />
  </div>
)