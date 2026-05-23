import { AlertCircle, ExternalLink } from 'lucide-react';

const LOOKER_STUDIO_REPORT_URL =
  process.env.NEXT_PUBLIC_LOOKER_STUDIO_REPORT_URL?.trim() ?? '';

function getLookerStudioViewUrl(embedUrl: string): string {
  return embedUrl.replace('/embed/reporting/', '/reporting/');
}

export function LookerStudioReport() {
  if (!LOOKER_STUDIO_REPORT_URL) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Data Studio</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Looker Studio report embed is not configured.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                Missing report URL
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                Set NEXT_PUBLIC_LOOKER_STUDIO_REPORT_URL to the generated
                Looker Studio embed URL, then rebuild the admin app.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Data Studio</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Embedded Looker Studio analytics report.
          </p>
        </div>

        <a
          href={getLookerStudioViewUrl(LOOKER_STUDIO_REPORT_URL)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Looker Studio
        </a>
      </div>

      <div className="h-[calc(100vh-190px)] min-h-[720px] overflow-hidden rounded-lg border border-gray-200 bg-white">
        <iframe
          title="Looker Studio analytics report"
          src={LOOKER_STUDIO_REPORT_URL}
          className="h-full w-full"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
