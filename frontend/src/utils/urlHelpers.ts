/**
 * Converts a company name to a URL-friendly string
 * @param name - The company name to convert
 * @returns URL-friendly string
 */
export const nameToUrlSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')     // Remove special characters except hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
};

/**
 * Finds a company from a list by matching URL slug
 * @param companies - Array of companies
 * @param urlSlug - The URL slug to match
 * @returns The matching company or undefined
 */
export const findCompanyByUrlSlug = (companies: any[], urlSlug: string): any => {
  return companies.find(company => {
    const companySlug = nameToUrlSlug(company.name);
    return companySlug === urlSlug;
  });
};
