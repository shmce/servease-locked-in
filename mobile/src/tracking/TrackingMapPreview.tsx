import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import Svg, {
  Circle as SvgCircle,
  Defs as SvgDefs,
  G as SvgG,
  Line as SvgLine,
  LinearGradient as SvgLinearGradient,
  Path as SvgPath,
  Rect as SvgRect,
  Stop as SvgStop,
  Text as SvgText,
} from 'react-native-svg';
import { MapPin, Navigation } from 'lucide-react-native';
import {
  BookingTrackingSnapshot,
  GeoAddressResult,
  GeoDirectionsRoute,
  GeoRouteLocation,
} from '../shared/models/types';
import { palette, radius, spacing, type } from '../theme/serveaseDesign';

type TrackingMapLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  headingDegrees?: number | null;
  speedMps?: number | null;
};

type TrackingMapMode = 'tracking' | 'navigation';

const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const MAPLIBRE_CDN_BASE = 'https://unpkg.com/maplibre-gl@5.24.0/dist';
const servicePickerDefaultCenter: TrackingMapLocation = {
  latitude: 14.554729,
  longitude: 121.024445,
};
const trackingMapIframeStyle = {
  border: 0,
  height: '100%',
  width: '100%',
};

interface TrackingMapPreviewProps {
  tracking: BookingTrackingSnapshot | null;
  title: string;
  subtitle: string;
  directions?: GeoDirectionsRoute | null;
  destinationMarkerLabel?: string;
  mode?: TrackingMapMode;
  navigationOrigin?: TrackingMapLocation | GeoRouteLocation | null;
  providerMarkerLabel?: string;
}

export function TrackingMapPreview({
  tracking,
  title,
  subtitle,
  directions,
  destinationMarkerLabel = 'Service address',
  mode = 'tracking',
  navigationOrigin,
  providerMarkerLabel,
}: TrackingMapPreviewProps) {
  const resolvedProviderMarkerLabel =
    providerMarkerLabel ?? (navigationOrigin ? 'Your location' : 'Route preview');
  const destination = tracking?.destinationLocation ?? null;
  const routeGeometry = directions?.geometry?.length ? directions.geometry : null;
  const actualProvider =
    navigationOrigin ??
    routeGeometry?.[0] ??
    tracking?.providerLocation ??
    null;
  const previewProvider =
    actualProvider ??
    derivePreviewProviderLocation(destination, tracking?.distanceKm ?? null);
  const visibleProvider = actualProvider ?? previewProvider;
  const hasMapLocation = Boolean(destination || visibleProvider);
  const points = projectTrackingPoints(visibleProvider, destination);
  const routePath =
    points.provider && points.destination
      ? `M ${points.provider.x} ${points.provider.y} C 108 42, 184 230, ${points.destination.x} ${points.destination.y}`
      : null;

  return (
    <View style={mapStyles.trackingMapCard}>
      {hasMapLocation ? (
        <View style={mapStyles.trackingMapWebViewFrame}>
          {Platform.OS === 'web' ? (
            createElement('iframe', {
              srcDoc: buildTrackingMapHtml(
                visibleProvider,
                destination,
                routeGeometry,
                {
                  destinationMarkerLabel,
                  mode,
                  providerMarkerLabel: resolvedProviderMarkerLabel,
                },
              ),
              style: trackingMapIframeStyle,
              title: 'Service tracking map',
            })
          ) : (
            <TrackingMapWebView
              destination={destination}
              points={points}
              provider={visibleProvider}
              mode={mode}
              providerLabel={resolvedProviderMarkerLabel}
              routeGeometry={routeGeometry}
              routePath={routePath}
              destinationLabel={destinationMarkerLabel}
            />
          )}
        </View>
      ) : (
        <TrackingMapSvgPreview
          destinationLabel={destinationMarkerLabel}
          providerLabel={resolvedProviderMarkerLabel}
          routePath={routePath}
          points={points}
        />
      )}
      {mode === 'navigation' ? (
        <View
          pointerEvents="none"
          style={mapStyles.trackingMapNavigationLegend}
        >
          <View style={mapStyles.trackingLegendItem}>
            <View
              style={[
                mapStyles.trackingLegendDot,
                mapStyles.trackingLegendDotProvider,
              ]}
            />
            <Text style={mapStyles.cardMeta}>{resolvedProviderMarkerLabel}</Text>
          </View>
          <View style={mapStyles.trackingLegendItem}>
            <View
              style={[
                mapStyles.trackingLegendDot,
                mapStyles.trackingLegendDotDestination,
              ]}
            />
            <Text style={mapStyles.cardMeta}>{destinationMarkerLabel}</Text>
          </View>
        </View>
      ) : null}
      {mode === 'tracking' ? (
        <View style={mapStyles.trackingMapOverlay}>
          <View style={mapStyles.providerSummaryRow}>
            <View style={mapStyles.quickIcon}>
              <Navigation color={palette.mint} size={20} strokeWidth={2.6} />
            </View>
            <View style={mapStyles.flex}>
              <Text style={mapStyles.cardTitle}>{title}</Text>
              <Text style={mapStyles.cardMeta}>{subtitle}</Text>
            </View>
          </View>
          <View style={mapStyles.trackingMapLegend}>
            <View style={mapStyles.trackingLegendItem}>
              <View
                style={[
                  mapStyles.trackingLegendDot,
                  mapStyles.trackingLegendDotProvider,
                ]}
              />
              <Text style={mapStyles.cardMeta}>
                {resolvedProviderMarkerLabel}
              </Text>
            </View>
            <View style={mapStyles.trackingLegendItem}>
              <View
                style={[
                  mapStyles.trackingLegendDot,
                  mapStyles.trackingLegendDotDestination,
                ]}
              />
              <Text style={mapStyles.cardMeta}>{destinationMarkerLabel}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function AddressVerificationPreview({
  result,
}: {
  result: GeoAddressResult;
}) {
  const destination = {
    latitude: result.latitude,
    longitude: result.longitude,
  };
  const points = projectTrackingPoints(null, destination);

  return (
    <View style={mapStyles.addressVerificationCard}>
      <View style={mapStyles.addressTrackingMapFrame}>
        {Platform.OS === 'web' ? (
          createElement('iframe', {
            srcDoc: buildTrackingMapHtml(null, destination, null, {
              destinationMarkerLabel: 'Service address',
              providerMarkerLabel: 'Route preview',
            }),
            style: trackingMapIframeStyle,
            title: 'Verified service address map',
          })
        ) : (
          <TrackingMapWebView
            destination={destination}
            destinationLabel="Service address"
            points={points}
            provider={null}
            providerLabel="Route preview"
            mode="tracking"
            routeGeometry={null}
            routePath={null}
          />
        )}
        <View pointerEvents="none" style={mapStyles.addressVerificationMapOverlay}>
          <View style={mapStyles.addressVerificationIcon}>
            <MapPin color={palette.white} size={17} strokeWidth={2.6} />
          </View>
          <View style={mapStyles.flex}>
            <Text style={mapStyles.addressVerificationTitle}>
              Service pin verified
            </Text>
            <Text style={mapStyles.cardMeta}>Review the pinned location</Text>
          </View>
        </View>
      </View>
      <View style={mapStyles.addressVerificationBody}>
        <View style={mapStyles.addressVerificationIcon}>
          <MapPin color={palette.white} size={17} strokeWidth={2.6} />
        </View>
        <View style={mapStyles.flex}>
          <Text style={mapStyles.addressVerificationTitle}>
            Resolved address
          </Text>
          <Text style={mapStyles.cardBody}>{result.formattedAddress}</Text>
          <Text style={mapStyles.cardMeta}>
            {result.provider === 'google-maps' ? 'Google Maps' : 'Geo provider'}{' '}
            - {result.latitude.toFixed(5)}, {result.longitude.toFixed(5)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function ServiceLocationPickerMap({
  center,
  onCenterChange,
}: {
  center: TrackingMapLocation | null;
  onCenterChange: (location: TrackingMapLocation) => void;
}) {
  const [mapFailed, setMapFailed] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const iframeRef =
    useRef<{ contentWindow?: { postMessage: (message: string, target: string) => void } } | null>(
      null,
    );
  const mapCenter = useMemo(() => center ?? servicePickerDefaultCenter, [center]);
  const initialMapCenterRef = useRef(mapCenter);
  const lastMapCenterRef = useRef(initialMapCenterRef.current);
  const points = projectTrackingPoints(null, mapCenter);
  const mapHtml = useMemo(() => buildServiceLocationPickerHtml(initialMapCenterRef.current), []);

  const recenterPickerMap = useCallback((location: TrackingMapLocation) => {
    const payload = JSON.stringify({
      type: 'recenter',
      latitude: location.latitude,
      longitude: location.longitude,
    });
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(payload, '*');
      return;
    }

    webViewRef.current?.injectJavaScript(`
      window.__serveasePickerMap?.recenter(${JSON.stringify(location.longitude)}, ${JSON.stringify(location.latitude)});
      true;
    `);
  }, []);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          latitude?: number;
          longitude?: number;
        };
        if (
          payload.type !== 'pin-change' ||
          typeof payload.latitude !== 'number' ||
          typeof payload.longitude !== 'number'
        ) {
          return;
        }
        const location = {
          latitude: payload.latitude,
          longitude: payload.longitude,
        };
        lastMapCenterRef.current = location;
        onCenterChange(location);
      } catch {
        // Ignore malformed map messages.
      }
    },
    [onCenterChange],
  );

  useEffect(() => {
    if (!center) {
      return;
    }
    if (sameTrackingLocation(center, lastMapCenterRef.current)) {
      return;
    }

    lastMapCenterRef.current = center;
    recenterPickerMap(center);
  }, [center, recenterPickerMap]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return undefined;
    }

    const handleWindowMessage = (event: MessageEvent) => {
      const data =
        typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
      handleMessage({ nativeEvent: { data } });
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [handleMessage]);

  if (mapFailed) {
    return (
      <TrackingMapSvgPreview
        destinationLabel="Service pin"
        providerLabel="Route preview"
        routePath={null}
        points={points}
      />
    );
  }

  return (
    <View style={mapStyles.servicePickerMapFrame}>
      {Platform.OS === 'web' ? (
        createElement('iframe', {
          ref: iframeRef,
          srcDoc: mapHtml,
          style: trackingMapIframeStyle,
          title: 'Choose service location map',
        })
      ) : (
        <WebView
          ref={webViewRef}
          domStorageEnabled
          javaScriptEnabled
          mixedContentMode="never"
          onError={() => setMapFailed(true)}
          onHttpError={() => setMapFailed(true)}
          onMessage={handleMessage}
          originWhitelist={['*']}
          scrollEnabled={false}
          setSupportMultipleWindows={false}
          source={{ html: mapHtml }}
          style={mapStyles.trackingMapWebView}
        />
      )}
      <View pointerEvents="none" style={mapStyles.servicePickerFixedPin}>
        <MapPin
          color={palette.mintDeep}
          fill={palette.white}
          size={42}
          strokeWidth={2.35}
        />
        <View style={mapStyles.servicePickerPinShadow} />
      </View>
    </View>
  );
}

function sameTrackingLocation(
  first: TrackingMapLocation,
  second: TrackingMapLocation,
): boolean {
  return (
    Math.abs(first.latitude - second.latitude) < 0.000001 &&
    Math.abs(first.longitude - second.longitude) < 0.000001
  );
}

function TrackingMapWebView({
  destination,
  destinationLabel,
  points,
  provider,
  providerLabel,
  mode,
  routeGeometry,
  routePath,
}: {
  destination: TrackingMapLocation | null;
  destinationLabel: string;
  points: {
    provider: { x: number; y: number } | null;
    destination: { x: number; y: number } | null;
  };
  provider: TrackingMapLocation | null;
  providerLabel: string;
  mode: TrackingMapMode;
  routeGeometry: TrackingMapLocation[] | null;
  routePath: string | null;
}) {
  const [mapFailed, setMapFailed] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const routeGeometryKey = useMemo(
    () =>
      routeGeometry
        ?.map((point) => `${point.latitude},${point.longitude}`)
        .join('|') ?? 'no-route',
    [routeGeometry],
  );
  const mapHtml = useMemo(
    () =>
      buildTrackingMapHtml(provider, destination, routeGeometry, {
        destinationMarkerLabel: destinationLabel,
        mode,
        providerMarkerLabel: providerLabel,
      }),
    [destination, destinationLabel, mode, provider, providerLabel, routeGeometry],
  );

  useEffect(() => {
    setMapFailed(false);
  }, [
    destination?.latitude,
    destination?.longitude,
    routeGeometryKey,
  ]);

  const injectProviderUpdate = useCallback(() => {
    const updateScript = buildProviderLocationUpdateScript(
      provider,
      routeGeometry,
      providerLabel,
    );
    if (!updateScript) {
      return;
    }

    webViewRef.current?.injectJavaScript(updateScript);
  }, [provider, providerLabel, routeGeometry]);

  useEffect(() => {
    injectProviderUpdate();
  }, [injectProviderUpdate]);

  if (mapFailed) {
    return (
      <TrackingMapSvgPreview
        destinationLabel={destinationLabel}
        providerLabel={providerLabel}
        routePath={routePath}
        points={points}
      />
    );
  }

  return (
    <WebView
      ref={webViewRef}
      domStorageEnabled
      javaScriptEnabled
      mixedContentMode="never"
      onError={() => setMapFailed(true)}
      onHttpError={() => setMapFailed(true)}
      onLoadEnd={injectProviderUpdate}
      originWhitelist={['*']}
      scrollEnabled={false}
      setSupportMultipleWindows={false}
      source={{ html: mapHtml }}
      style={mapStyles.trackingMapWebView}
    />
  );
}

function buildServiceLocationPickerHtml(center: TrackingMapLocation): string {
  const coordinate = [center.longitude, center.latitude];
  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="${MAPLIBRE_CDN_BASE}/maplibre-gl.css" />
  <style>
    html, body, #map { margin: 0; width: 100%; height: 100%; overflow: hidden; }
    body { background: #E5E7EB; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    #fallback {
      align-items: center;
      background: linear-gradient(135deg, #E8F8EF 0%, #E6F0FF 100%);
      color: #6B7280;
      display: flex;
      font-size: 13px;
      font-weight: 700;
      inset: 0;
      justify-content: center;
      padding: 18px;
      position: fixed;
      text-align: center;
    }
    .maplibregl-ctrl-bottom-right {
      bottom: 214px !important;
      right: 14px !important;
    }
    .maplibregl-ctrl-attrib {
      border-radius: 999px;
      box-shadow: 0 6px 16px rgba(17,24,39,0.12);
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div id="map" aria-label="Service location picker map"></div>
  <div id="fallback">Loading map tiles...</div>
  <script src="${MAPLIBRE_CDN_BASE}/maplibre-gl.js"></script>
  <script>
    const styleUrl = ${JSON.stringify(OPENFREEMAP_STYLE_URL)};
    const initialCenter = ${JSON.stringify(coordinate)};
    const fallback = document.getElementById('fallback');
    const postPin = (map) => {
      const center = map.getCenter();
      const payload = JSON.stringify({
        type: 'pin-change',
        latitude: center.lat,
        longitude: center.lng
      });
      window.ReactNativeWebView?.postMessage(payload);
      window.parent?.postMessage(payload, '*');
    };
    try {
      const map = new maplibregl.Map({
        attributionControl: false,
        center: initialCenter,
        container: 'map',
        interactive: true,
        pitchWithRotate: false,
        style: styleUrl,
        zoom: 16
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      map.dragRotate.disable();
      map.touchPitch?.disable?.();
      window.__serveasePickerMap = {
        recenter: (longitude, latitude) => {
          if (typeof longitude !== 'number' || typeof latitude !== 'number') {
            return;
          }
          map.easeTo({
            center: [longitude, latitude],
            duration: 180
          });
        }
      };
      window.addEventListener('message', (event) => {
        try {
          const message = typeof event.data === 'string'
            ? JSON.parse(event.data)
            : event.data;
          if (
            message?.type === 'recenter' &&
            typeof message.latitude === 'number' &&
            typeof message.longitude === 'number'
          ) {
            window.__serveasePickerMap.recenter(message.longitude, message.latitude);
          }
        } catch (error) {
          // Ignore malformed parent messages.
        }
      });
      map.on('load', () => {
        fallback.style.display = 'none';
        postPin(map);
      });
      map.on('moveend', () => postPin(map));
      map.on('click', (event) => {
        map.easeTo({
          center: [event.lngLat.lng, event.lngLat.lat],
          duration: 180
        });
      });
      map.on('error', () => {
        if (!map.loaded()) {
          fallback.textContent = 'Map tiles are temporarily unavailable.';
        }
      });
    } catch (error) {
      fallback.textContent = 'Map tiles are temporarily unavailable.';
    }
  </script>
</body>
</html>`;
}

function TrackingMapSvgPreview({
  destinationLabel,
  providerLabel,
  routePath,
  points,
}: {
  destinationLabel: string;
  providerLabel: string;
  routePath: string | null;
  points: {
    provider: { x: number; y: number } | null;
    destination: { x: number; y: number } | null;
  };
}) {
  return (
    <Svg viewBox="0 0 320 260" style={mapStyles.trackingMapSvg}>
      <SvgDefs>
        <SvgLinearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
          <SvgStop offset="0" stopColor="#DDEFE4" />
          <SvgStop offset="0.52" stopColor="#E8F3EC" />
          <SvgStop offset="1" stopColor="#D7E9F8" />
        </SvgLinearGradient>
      </SvgDefs>
      <SvgRect x="0" y="0" width="320" height="260" fill="url(#mapBg)" />
      {[28, 84, 140, 196, 252].map((x) => (
        <SvgLine
          key={`v-${x}`}
          x1={x}
          y1="-20"
          x2={x + 34}
          y2="280"
          stroke="#FFFFFF"
          strokeOpacity="0.48"
          strokeWidth="3"
        />
      ))}
      {[36, 92, 148, 204].map((y) => (
        <SvgLine
          key={`h-${y}`}
          x1="-20"
          y1={y}
          x2="340"
          y2={y - 24}
          stroke="#FFFFFF"
          strokeOpacity="0.42"
          strokeWidth="3"
        />
      ))}
      {routePath ? (
        <SvgPath
          d={routePath}
          fill="none"
          stroke="#0B7A44"
          strokeLinecap="round"
          strokeWidth="8"
        />
      ) : null}
      {routePath ? (
        <SvgPath
          d={routePath}
          fill="none"
          stroke="#FFFFFF"
          strokeDasharray="10 12"
          strokeLinecap="round"
          strokeWidth="3"
        />
      ) : null}
      {points.provider ? (
        <SvgG>
          <SvgMarkerLabel
            label={providerLabel}
            point={points.provider}
            variant="provider"
          />
          <SvgCircle
            cx={points.provider.x}
            cy={points.provider.y}
            r="15"
            fill="#FFFFFF"
          />
          <SvgCircle
            cx={points.provider.x}
            cy={points.provider.y}
            r="9"
            fill="#2F6FED"
          />
        </SvgG>
      ) : null}
      {points.destination ? (
        <SvgG>
          <SvgMarkerLabel
            label={destinationLabel}
            point={points.destination}
            variant="destination"
          />
          <SvgCircle
            cx={points.destination.x}
            cy={points.destination.y}
            r="18"
            fill="#FFFFFF"
          />
          <SvgCircle
            cx={points.destination.x}
            cy={points.destination.y}
            r="11"
            fill="#00BF63"
          />
        </SvgG>
      ) : null}
    </Svg>
  );
}

function SvgMarkerLabel({
  label,
  point,
  variant,
}: {
  label: string;
  point: { x: number; y: number };
  variant: 'provider' | 'destination';
}) {
  const labelWidth = Math.max(68, Math.min(126, label.length * 7 + 20));
  const labelX = Math.max(8, Math.min(320 - labelWidth - 8, point.x - labelWidth / 2));
  const labelY = Math.max(14, point.y - 48);
  const color = variant === 'provider' ? '#2563EB' : '#00BF63';

  return (
    <SvgG>
      <SvgRect
        x={labelX}
        y={labelY}
        width={labelWidth}
        height="24"
        rx="12"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2"
      />
      <SvgText
        x={labelX + labelWidth / 2}
        y={labelY + 16}
        fill="#111827"
        fontSize="11"
        fontWeight="700"
        textAnchor="middle"
      >
        {label}
      </SvgText>
    </SvgG>
  );
}

function buildTrackingMapHtml(
  provider: TrackingMapLocation | null,
  destination: TrackingMapLocation | null,
  routeGeometry: TrackingMapLocation[] | null = null,
  options: {
    destinationMarkerLabel?: string;
    mode?: TrackingMapMode;
    providerMarkerLabel?: string;
  } = {},
): string {
  const mode = options.mode ?? 'tracking';
  const destinationMarkerLabel = options.destinationMarkerLabel ?? 'Service address';
  const providerMarkerLabel = options.providerMarkerLabel ?? 'Route preview';
  const providerCoordinate = provider
    ? [provider.longitude, provider.latitude]
    : null;
  const destinationCoordinate = destination
    ? [destination.longitude, destination.latitude]
    : null;
  const routeCoordinates =
    routeGeometry?.map((point) => [point.longitude, point.latitude]) ?? null;
  const providerHeading = normalizeHeading(provider?.headingDegrees ?? null);
  const routeBearing =
    provider && routeGeometry?.length
      ? deriveRouteBearing(provider, routeGeometry)
      : null;
  const cameraBearing = providerHeading ?? routeBearing ?? 0;
  const isNavigationMode = mode === 'navigation';

  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="${MAPLIBRE_CDN_BASE}/maplibre-gl.css" />
  <style>
    html, body, #map { margin: 0; width: 100%; height: 100%; overflow: hidden; }
    body { background: #E5E7EB; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .provider-marker {
      align-items: center;
      background: #2563EB;
      border: 5px solid #FFFFFF;
      border-radius: 999px;
      box-shadow: 0 10px 26px rgba(37,99,235,0.34);
      color: #FFFFFF;
      display: flex;
      font-size: 17px;
      font-weight: 900;
      height: 34px;
      justify-content: center;
      line-height: 1;
      position: relative;
      width: 34px;
    }
    .provider-marker::before {
      content: '▲';
      display: block;
      transform: translateY(-1px);
    }
    .provider-marker::after {
      border: 2px solid rgba(37,99,235,0.32);
      border-radius: 999px;
      content: '';
      inset: -11px;
      pointer-events: none;
      position: absolute;
    }
    .destination-marker::after {
      background: rgba(255,255,255,0.96);
      border: 2px solid #00BF63;
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(17,24,39,0.16);
      color: #111827;
      content: attr(data-label);
      font-size: 12px;
      font-weight: 800;
      left: 50%;
      line-height: 1;
      padding: 7px 10px;
      position: absolute;
      top: -42px;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    .destination-marker {
      background: #00BF63;
      border: 5px solid #FFFFFF;
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(0,191,99,0.28);
      height: 28px;
      width: 28px;
    }
    #fallback {
      align-items: center;
      background: linear-gradient(135deg, #E8F8EF 0%, #E6F0FF 100%);
      color: #6B7280;
      display: flex;
      font-size: 13px;
      font-weight: 700;
      inset: 0;
      justify-content: center;
      padding: 18px;
      position: fixed;
      text-align: center;
    }
    .map-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: fixed;
      right: 14px;
      top: 92px;
      z-index: 3;
    }
    .map-control {
      align-items: center;
      background: rgba(255,255,255,0.96);
      border: 0;
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(17,24,39,0.18);
      color: #111827;
      display: flex;
      font-size: 16px;
      font-weight: 900;
      height: 44px;
      justify-content: center;
      line-height: 1;
      padding: 0;
      width: 44px;
    }
    .map-control[hidden],
    .map-controls[hidden] {
      display: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="map-controls" ${isNavigationMode ? '' : 'hidden'}>
    <button id="recenter-control" class="map-control" type="button" aria-label="Recenter on your location" hidden>&#8982;</button>
    <button id="orientation-control" class="map-control" type="button" aria-label="Reset map orientation" hidden>&#8593;</button>
    <button id="overview-control" class="map-control" type="button" aria-label="Show full route">&#8599;</button>
  </div>
  <div id="fallback">Loading map tiles...</div>
  <script src="${MAPLIBRE_CDN_BASE}/maplibre-gl.js"></script>
  <script>
    const styleUrl = ${JSON.stringify(OPENFREEMAP_STYLE_URL)};
    let provider = ${JSON.stringify(providerCoordinate)};
    const destination = ${JSON.stringify(destinationCoordinate)};
    const route = ${JSON.stringify(routeCoordinates)};
    const destinationMarkerLabel = ${JSON.stringify(destinationMarkerLabel)};
    const isNavigationMode = ${JSON.stringify(isNavigationMode)};
    let cameraBearing = ${JSON.stringify(cameraBearing)};
    let providerMarkerLabel = ${JSON.stringify(providerMarkerLabel)};
    let providerHeading = ${JSON.stringify(providerHeading)};
    const fallback = document.getElementById('fallback');
    const recenterControl = document.getElementById('recenter-control');
    const orientationControl = document.getElementById('orientation-control');
    const overviewControl = document.getElementById('overview-control');
    let followProvider = true;
    let isProgrammaticCameraMove = false;
    const marker = (kind) => {
      const element = document.createElement('div');
      element.className = kind === 'provider' ? 'provider-marker' : 'destination-marker';
      element.dataset.label = kind === 'provider' ? providerMarkerLabel : destinationMarkerLabel;
      element.setAttribute('aria-label', element.dataset.label);
      if (kind === 'provider' && providerHeading !== null) {
        element.style.rotate = providerHeading + 'deg';
      }
      return element;
    };
    let pendingTrackingUpdate = null;
    window.__serveaseUpdateTracking = (payload) => {
      pendingTrackingUpdate = payload;
    };

    try {
      const map = new maplibregl.Map({
        attributionControl: false,
        center: provider && isNavigationMode ? provider : destination || provider,
        container: 'map',
        interactive: isNavigationMode,
        bearing: provider && isNavigationMode ? cameraBearing : 0,
        pitch: provider && isNavigationMode ? 62 : 0,
        pitchWithRotate: false,
        style: styleUrl,
        zoom: provider && isNavigationMode ? 16 : provider ? 12 : 14
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      if (isNavigationMode) {
        map.dragRotate.disable();
        map.touchZoomRotate.enable();
        map.touchPitch?.disable?.();
      }
      let routeSourceReady = false;
      const providerFeature = () => ({
        type: 'Feature',
        properties: { label: providerMarkerLabel },
        geometry: { type: 'Point', coordinates: provider || destination }
      });
      const addOrUpdateProviderIndicator = () => {
        if (!provider) {
          return;
        }
        if (!map.loaded()) {
          return;
        }
        if (map.getSource('provider-location')) {
          map.getSource('provider-location')?.setData(providerFeature());
          return;
        }
        map.addSource('provider-location', {
          type: 'geojson',
          data: providerFeature()
        });
        map.addLayer({
          id: 'provider-location-ring',
          type: 'circle',
          source: 'provider-location',
          paint: {
            'circle-color': 'rgba(37,99,235,0.20)',
            'circle-radius': 21,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 2
          }
        });
        map.addLayer({
          id: 'provider-location-dot',
          type: 'circle',
          source: 'provider-location',
          paint: {
            'circle-color': '#2563EB',
            'circle-radius': 10,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 4
          }
        });
        map.addLayer({
          id: 'provider-location-arrow',
          type: 'symbol',
          source: 'provider-location',
          layout: {
            'text-field': '▲',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'text-rotate': cameraBearing,
            'text-size': 15
          },
          paint: {
            'text-color': '#FFFFFF'
          }
        });
        map.addLayer({
          id: 'provider-location-label',
          type: 'symbol',
          source: 'provider-location',
          layout: {
            'text-allow-overlap': true,
            'text-field': ['get', 'label'],
            'text-ignore-placement': true,
            'text-offset': [0, 2.2],
            'text-size': 12
          },
          paint: {
            'text-color': '#111827',
            'text-halo-blur': 0.4,
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 4
          }
        });
      }
      if (destination) {
        new maplibregl.Marker({ element: marker('destination') }).setLngLat(destination).addTo(map);
      }

      map.on('load', () => {
        fallback.style.display = 'none';
        const currentRouteLine = () => route || (provider && destination ? [provider, destination] : null);
        const withProgrammaticCameraMove = (move) => {
          isProgrammaticCameraMove = true;
          move();
          window.setTimeout(() => {
            isProgrammaticCameraMove = false;
          }, 360);
        };
        const fitRouteBounds = () => {
          const routeLine = currentRouteLine();
          if (!routeLine) {
            return;
          }
          const bounds = routeLine.reduce(
            (nextBounds, coordinate) => nextBounds.extend(coordinate),
            new maplibregl.LngLatBounds(routeLine[0], routeLine[0])
          ).extend(destination);
          withProgrammaticCameraMove(() => {
            map.fitBounds(bounds, { duration: 280, maxZoom: 14, padding: 42 });
          });
        };
        const addOrUpdateRouteLine = () => {
          const routeLine = currentRouteLine();
          if (!routeLine) {
            return;
          }
          const routeData = {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: routeLine }
          };
          if (routeSourceReady) {
            map.getSource('tracking-route')?.setData(routeData);
            return;
          }
          map.addSource('tracking-route', {
            type: 'geojson',
            data: routeData
          });
          map.addLayer({
            id: 'tracking-route-casing',
            type: 'line',
            source: 'tracking-route',
            paint: { 'line-color': '#FFFFFF', 'line-width': isNavigationMode ? 14 : 8, 'line-opacity': 0.96 }
          });
          map.addLayer({
            id: 'tracking-route-line',
            type: 'line',
            source: 'tracking-route',
            paint: { 'line-color': isNavigationMode ? '#16A34A' : '#0B7A44', 'line-width': isNavigationMode ? 8 : 4, 'line-opacity': 0.96 }
          });
          routeSourceReady = true;
          addOrUpdateProviderIndicator();
        };
        const followCurrentProvider = () => {
          if (!provider) {
            fitRouteBounds();
            return;
          }
          withProgrammaticCameraMove(() => {
            map.easeTo({
              bearing: cameraBearing,
              center: provider,
              duration: 280,
              offset: [0, 110],
              pitch: 62,
              zoom: 16
            });
          });
        };
        const applyTrackingUpdate = (payload) => {
          if (!payload || !Array.isArray(payload.provider)) {
            return;
          }
          provider = payload.provider;
          providerMarkerLabel = payload.providerMarkerLabel ?? providerMarkerLabel;
          providerHeading = payload.providerHeading ?? null;
          cameraBearing = payload.cameraBearing ?? cameraBearing;
          addOrUpdateProviderIndicator();
          map.setLayoutProperty('provider-location-arrow', 'text-rotate', cameraBearing);
          addOrUpdateRouteLine();
          if (isNavigationMode && followProvider) {
            followCurrentProvider();
          }
        };
        window.__serveaseUpdateTracking = applyTrackingUpdate;
        const resetOrientation = () => {
          if (orientationControl) {
            orientationControl.hidden = true;
          }
          withProgrammaticCameraMove(() => {
            map.easeTo({
              bearing: cameraBearing,
              duration: 280,
              pitch: 62
            });
          });
        };
        const pauseFollowForInspection = () => {
          if (!isNavigationMode || isProgrammaticCameraMove) {
            return;
          }
          followProvider = false;
          if (recenterControl) {
            recenterControl.hidden = false;
          }
        };
        if (isNavigationMode) {
          map.on('dragstart', pauseFollowForInspection);
          map.on('zoomstart', pauseFollowForInspection);
          map.on('rotatestart', () => {
            pauseFollowForInspection();
            if (orientationControl) {
              orientationControl.hidden = false;
            }
          });
          recenterControl?.addEventListener('click', () => {
            followProvider = true;
            recenterControl.hidden = true;
            if (orientationControl) {
              orientationControl.hidden = true;
            }
            followCurrentProvider();
          });
          orientationControl?.addEventListener('click', resetOrientation);
          overviewControl?.addEventListener('click', () => {
            pauseFollowForInspection();
            fitRouteBounds();
          });
        }
        addOrUpdateRouteLine();
        addOrUpdateProviderIndicator();
        if (pendingTrackingUpdate) {
          applyTrackingUpdate(pendingTrackingUpdate);
          pendingTrackingUpdate = null;
        }
        if (isNavigationMode && provider) {
          if (followProvider) {
            map.jumpTo({
              bearing: cameraBearing,
              center: provider,
              offset: [0, 110],
              pitch: 62,
              zoom: 16
            });
          }
          return;
        }
        fitRouteBounds();
      });
      map.on('error', () => {
        if (!map.loaded()) {
          fallback.textContent = 'Map tiles are temporarily unavailable.';
        }
      });
    } catch (error) {
      fallback.textContent = 'Map tiles are temporarily unavailable.';
    }
  </script>
</body>
</html>`;
}

function buildProviderLocationUpdateScript(
  provider: TrackingMapLocation | null,
  routeGeometry: TrackingMapLocation[] | null,
  providerMarkerLabel: string,
): string | null {
  if (!provider) {
    return null;
  }

  const providerHeading = normalizeHeading(provider.headingDegrees ?? null);
  const routeBearing = routeGeometry?.length
    ? deriveRouteBearing(provider, routeGeometry)
    : null;
  const payload = {
    cameraBearing: providerHeading ?? routeBearing ?? 0,
    provider: [provider.longitude, provider.latitude],
    providerHeading,
    providerMarkerLabel,
  };

  return `window.__serveaseUpdateTracking?.(${JSON.stringify(payload)}); true;`;
}

function normalizeHeading(heading: number | null): number | null {
  if (heading === null || !Number.isFinite(heading)) {
    return null;
  }

  return ((heading % 360) + 360) % 360;
}

function deriveRouteBearing(
  provider: TrackingMapLocation,
  routeGeometry: TrackingMapLocation[],
): number | null {
  if (routeGeometry.length < 2) {
    return null;
  }

  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  routeGeometry.forEach((point, index) => {
    const distance =
      (point.latitude - provider.latitude) ** 2 +
      (point.longitude - provider.longitude) ** 2;
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  const nextPoint = routeGeometry[Math.min(closestIndex + 1, routeGeometry.length - 1)];
  const currentPoint = routeGeometry[closestIndex];
  if (!nextPoint || currentPoint === nextPoint) {
    return null;
  }

  return bearingBetween(currentPoint, nextPoint);
}

function bearingBetween(
  start: TrackingMapLocation,
  end: TrackingMapLocation,
): number {
  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);
  const y = Math.sin(longitudeDelta) * Math.cos(endLatitude);
  const x =
    Math.cos(startLatitude) * Math.sin(endLatitude) -
    Math.sin(startLatitude) * Math.cos(endLatitude) * Math.cos(longitudeDelta);

  return normalizeHeading((Math.atan2(y, x) * 180) / Math.PI) ?? 0;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function derivePreviewProviderLocation(
  destination: TrackingMapLocation | null,
  distanceKm: number | null,
): TrackingMapLocation | null {
  if (!destination || distanceKm === null) {
    return null;
  }

  const offset = Math.min(Math.max(distanceKm, 1.4), 8) * 0.006;
  return {
    latitude: destination.latitude + offset,
    longitude: destination.longitude - offset * 0.75,
  };
}

function projectTrackingPoints(
  provider: TrackingMapLocation | null,
  destination: TrackingMapLocation | null,
): {
  provider: { x: number; y: number } | null;
  destination: { x: number; y: number } | null;
} {
  const locations = [provider, destination].filter(
    Boolean,
  ) as TrackingMapLocation[];

  if (!locations.length) {
    return { provider: null, destination: null };
  }

  const latitudes = locations.map((location) => location.latitude);
  const longitudes = locations.map((location) => location.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lngRange = Math.max(maxLng - minLng, 0.01);

  const project = (location: TrackingMapLocation | null) => {
    if (!location) {
      return null;
    }

    return {
      x: 48 + ((location.longitude - minLng) / lngRange) * 224,
      y: 212 - ((location.latitude - minLat) / latRange) * 164,
    };
  };

  return {
    provider: project(provider),
    destination: project(destination),
  };
}

const mapStyles = StyleSheet.create({
  addressVerificationBody: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  addressVerificationCard: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  addressVerificationIcon: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  addressVerificationTitle: {
    color: palette.ink,
    fontSize: type.caption.fontSize,
    fontWeight: '700',
  },
  addressVerificationMapOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.lg,
    boxShadow: '0 8px 18px rgba(17,24,39,0.14)',
    flexDirection: 'row',
    gap: spacing.sm,
    left: spacing.md,
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    top: spacing.md,
    zIndex: 3,
  },
  addressTrackingMapFrame: {
    backgroundColor: '#E5E7EB',
    height: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBody: {
    color: palette.body,
    fontSize: type.caption.fontSize,
    lineHeight: 20,
  },
  cardMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    color: palette.ink,
    fontSize: type.body.fontSize,
    fontWeight: '700',
  },
  flex: {
    flex: 1,
  },
  providerSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickIcon: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  servicePickerFixedPin: {
    alignItems: 'center',
    height: 54,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -21,
    marginTop: -48,
    position: 'absolute',
    shadowColor: '#00A85A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    top: '50%',
    width: 42,
    zIndex: 4,
  },
  servicePickerPinShadow: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    height: 7,
    marginTop: -6,
    width: 18,
  },
  servicePickerMapFrame: {
    backgroundColor: '#E5E7EB',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  trackingLegendDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  trackingLegendDotDestination: {
    backgroundColor: '#00BF63',
  },
  trackingLegendDotProvider: {
    backgroundColor: '#2F6FED',
  },
  trackingLegendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  trackingMapCard: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E5E7EB',
  },
  trackingMapLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  trackingMapNavigationLegend: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.pill,
    boxShadow: '0 8px 18px rgba(17,24,39,0.14)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    left: spacing.md,
    maxWidth: '72%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    top: 104,
    zIndex: 3,
  },
  trackingMapOverlay: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.lg,
    left: spacing.md,
    padding: spacing.md,
    position: 'absolute',
    right: spacing.md,
    top: spacing.lg,
  },
  trackingMapSvg: {
    height: '100%',
    width: '100%',
  },
  trackingMapWebViewFrame: {
    flex: 1,
  },
  trackingMapWebView: {
    backgroundColor: '#E5E7EB',
    flex: 1,
  },
});
