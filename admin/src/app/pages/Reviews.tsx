import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { AlertCircle, Eye, EyeOff, Flag, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminReviews,
  setAdminReviewFlagged,
  type AdminReviewSummary,
} from "../../services/serveaseAdminApi";

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}

export function Reviews() {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState<AdminReviewSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [filterFlaggedOnly, setFilterFlaggedOnly] = useState(false);
  const [search, setSearch] = useState("");

  const loadReviews = useCallback(
    async (flaggedOnly: boolean) => {
      if (!accessToken) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await listAdminReviews(accessToken, {
          flaggedOnly,
          limit: 200,
        });
        setReviews(data);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load reviews.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void loadReviews(filterFlaggedOnly);
  }, [loadReviews, filterFlaggedOnly]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((review) => {
      const haystack = [
        review.reviewerFullName ?? "",
        review.reviewText ?? "",
        review.providerId,
        review.bookingId,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [reviews, search]);

  const flaggedCount = reviews.filter((review) => review.isFlagged).length;
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const handleToggleFlag = async (review: AdminReviewSummary) => {
    if (!accessToken) return;
    setPendingId(review.id);
    try {
      const updated = await setAdminReviewFlagged(
        accessToken,
        review.id,
        !review.isFlagged,
        review.isFlagged ? "Restored by admin" : "Hidden by admin",
      );
      setReviews((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(
        updated.isFlagged ? "Review hidden from listings." : "Review restored.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update review.",
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">Reviews Moderation</h1>
        <p className="text-sm text-gray-500">
          Track every rating and comment customers leave for providers. Hide
          abusive content or restore reviews that were flagged in error.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-semibold">
                {averageRating.toFixed(2)}
              </div>
              <RatingStars rating={averageRating} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Flagged / hidden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-semibold">{flaggedCount}</div>
              {flaggedCount > 0 ? (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  needs review
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">All reviews</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reviewer, text, provider..."
                className="pl-8 w-64"
              />
            </div>
            <Button
              variant={filterFlaggedOnly ? "default" : "outline"}
              onClick={() => setFilterFlaggedOnly((value) => !value)}
              size="sm"
            >
              <Flag className="w-4 h-4 mr-1" />
              {filterFlaggedOnly ? "Flagged only" : "All reviews"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <div className="flex items-center gap-2 text-red-600 text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              {loadError}
            </div>
          ) : null}
          {isLoading ? (
            <div className="text-sm text-gray-500 py-6 text-center">
              Loading reviews...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500 py-6 text-center">
              No reviews match the current filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <RatingStars rating={review.rating} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {review.reviewerFullName ??
                        review.reviewerId.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="max-w-md text-sm text-gray-700">
                      {review.reviewText ?? (
                        <span className="text-gray-400 italic">No comment.</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-gray-500">
                      {review.providerId.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-gray-500">
                      {review.bookingId.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </TableCell>
                    <TableCell>
                      {review.isFlagged ? (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          Hidden
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Visible
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={review.isFlagged ? "outline" : "default"}
                        onClick={() => void handleToggleFlag(review)}
                        disabled={pendingId === review.id}
                      >
                        {review.isFlagged ? (
                          <>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Restore
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 mr-1" />
                            Hide
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
