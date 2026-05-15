import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HomeProfileProps {
  name: string;
  email: string;
  avatarUrl?: string;
  joinedAt: string;
}

export function HomeProfile({ name, email, avatarUrl, joinedAt }: HomeProfileProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium truncate max-w-[140px]">{name}</p>
        <p className="text-xs text-muted-foreground">Since {memberSince}</p>
      </div>
      <Avatar className="h-9 w-9 ring-2 ring-border">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}
