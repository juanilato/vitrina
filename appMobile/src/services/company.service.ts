/**
 * Company Service
 */

import api from '../config/axios.config';
import { Company, CompanyWithProducts } from '../types/company';

export const companyService = {
  /**
   * Get all companies
   */
  async getAllCompanies(): Promise<Company[]> {
    const response = await api.get<Company[]>('/auth/companies');
    return response.data;
  },

  /**
   * Get companies near a location
   * @param lat Latitude
   * @param lng Longitude
   * @param radiusKm Radius in kilometers (default 10)
   */
  async getCompaniesByLocation(lat: number, lng: number, radiusKm: number = 10): Promise<Company[]> {
    const response = await api.get<Company[]>('/auth/companies/nearby', {
      params: { lat, lng, radius: radiusKm },
    });
    return response.data;
  },

  /**
   * Get company by ID with locations and preferences
   */
  async getCompanyById(companyId: string): Promise<Company> {
    const response = await api.get<Company>(
      `/empresas/${companyId}`
    );
    return response.data;
  },

  /**
   * Get company by name (public)
   */
  async getCompanyByName(companyName: string): Promise<Company> {
    const response = await api.get<Company>(
      `/auth/companies/by-name/${encodeURIComponent(companyName)}`
    );
    return response.data;
  },

  /**
   * Get company with products
   */
  async getCompanyWithProducts(companyId: string): Promise<CompanyWithProducts> {
    const [company, products] = await Promise.all([
      this.getCompanyById(companyId),
      this.getCompanyProducts(companyId),
    ]);

    return {
      ...company,
      products,
    };
  },

  /**
   * Get company with products by name (public)
   */
  async getCompanyWithProductsByName(companyName: string): Promise<CompanyWithProducts> {
    const company = await this.getCompanyByName(companyName);
    const products = await this.getCompanyProducts(company.id);

    return {
      ...company,
      products,
    };
  },

  /**
   * Get company products
   */
  async getCompanyProducts(companyId: string) {
    const response = await api.get(`/productos/empresa/${companyId}`);
    return response.data;
  },
};
