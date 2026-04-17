export type OrcidProfile = {
  name: string;
  orcid: string;
  publications: string[];
  affiliations: string[];
  keywords: string[];
};

type OrcidNameObject = {
  'given-names'?: { value?: string };
  'family-name'?: { value?: string };
  creditName?: { value?: string };
};

type OrcidWorkSummary = {
  title?: {
    title?: {
      value?: string;
    };
  };
};

type OrcidRecord = {
  orcidIdentifier?: {
    path?: string;
  };
  person?: {
    name?: OrcidNameObject;
    keywords?: {
      keyword?: Array<{ content?: string }>;
    };
  };
  activitiesSummary?: {
    works?: {
      group?: Array<{
        'work-summary'?: OrcidWorkSummary[];
      }>;
    };
    employments?: {
      'affiliation-group'?: Array<{
        summaries?: Array<{
          'employment-summary'?: {
            organization?: { name?: string };
          };
        }>;
      }>;
    };
    educations?: {
      'affiliation-group'?: Array<{
        summaries?: Array<{
          'education-summary'?: {
            organization?: { name?: string };
          };
        }>;
      }>;
    };
  };
};

const asArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

export function parseOrcidData(rawString: string | null | undefined): OrcidRecord {
  if (!rawString || typeof rawString !== 'string') {
    return {};
  }

  try {
    const parsed = JSON.parse(rawString);
    return parsed && typeof parsed === 'object' ? (parsed as OrcidRecord) : {};
  } catch {
    return {};
  }
}

export function extractName(record: OrcidRecord): string {
  const name = record.person?.name;
  const creditName = name?.creditName?.value?.trim();
  if (creditName) return creditName;

  const given = name?.['given-names']?.value?.trim() || '';
  const family = name?.['family-name']?.value?.trim() || '';
  return `${given} ${family}`.trim();
}

export function extractPublications(record: OrcidRecord): string[] {
  const groups = asArray(record.activitiesSummary?.works?.group);
  const publications = groups.flatMap((group) =>
    asArray(group['work-summary'])
      .map((work) => work.title?.title?.value?.trim())
      .filter((value): value is string => Boolean(value)),
  );

  return [...new Set(publications)];
}

export function extractAffiliations(record: OrcidRecord): string[] {
  const employmentAffiliations = asArray(record.activitiesSummary?.employments?.['affiliation-group']).flatMap(
    (group) =>
      asArray(group.summaries)
        .map((summary) => summary['employment-summary']?.organization?.name?.trim())
        .filter((value): value is string => Boolean(value)),
  );

  const educationAffiliations = asArray(record.activitiesSummary?.educations?.['affiliation-group']).flatMap(
    (group) =>
      asArray(group.summaries)
        .map((summary) => summary['education-summary']?.organization?.name?.trim())
        .filter((value): value is string => Boolean(value)),
  );

  return [...new Set([...employmentAffiliations, ...educationAffiliations])];
}

export function extractKeywords(record: OrcidRecord): string[] {
  return [...new Set(
    asArray(record.person?.keywords?.keyword)
      .map((keyword) => keyword.content?.trim())
      .filter((value): value is string => Boolean(value)),
  )];
}

export function toOrcidProfile(rawString: string | null | undefined): OrcidProfile {
  const record = parseOrcidData(rawString);

  return {
    name: extractName(record),
    orcid: record.orcidIdentifier?.path?.trim() || '',
    publications: extractPublications(record),
    affiliations: extractAffiliations(record),
    keywords: extractKeywords(record),
  };
}
