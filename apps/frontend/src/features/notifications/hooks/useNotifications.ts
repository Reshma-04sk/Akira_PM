import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services/api/notifications.api";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  list: () => [...NOTIFICATION_KEYS.all, "list"] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
};

export function useNotifications(pollingInterval?: number) {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: NOTIFICATION_KEYS.list(),
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.listPaginated({ params: { page: pageParam, page_size: 15 } }).then((res) => res.data),
    getNextPageParam: (lastPage) => {
      const { page, page_size, total } = lastPage;
      const hasMore = page * page_size < total;
      return hasMore ? page + 1 : undefined;
    },
    initialPageParam: 1,
    refetchInterval: pollingInterval,
  });

  const notifications = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });

  return {
    notifications,
    totalCount,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markRead: markReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}

export function useUnreadCount(pollingInterval?: number) {
  const { data, refetch } = useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: () =>
      notificationsApi.listPaginated({ params: { is_read: false, page: 1, page_size: 1 } }).then((res) => res.data),
    refetchInterval: pollingInterval,
  });

  return {
    unreadCount: data?.total ?? 0,
    refetch,
  };
}
