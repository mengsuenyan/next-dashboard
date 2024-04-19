// Route groups allow you to organize files into logical groups without affecting the URL path structure. When you create a new folder using parentheses (), the name won't be included in the URL path. So /dashboard/(overview)/page.tsx becomes /dashboard.
import DashboardSkeleton from "@/app/ui/skeletons";

export default function Loading() {
    return (
        <DashboardSkeleton />
    )
}