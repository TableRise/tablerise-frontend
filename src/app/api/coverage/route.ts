export const dynamic = 'force-dynamic';

type CoverageGlobal = typeof globalThis & {
    __coverage__?: Record<string, unknown>;
};

export async function GET(): Promise<Response> {
    return Response.json((globalThis as CoverageGlobal).__coverage__ ?? {});
}
