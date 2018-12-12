
import { Account } from 'app/api/models';
import { DashboardItemType } from 'app/content/dashbord-item-type';
import { QuickAccessDescriptor } from 'app/content/quick-access-descriptor';
import { Breakpoint } from 'app/shared/layout.service';
import { Content } from 'app/content/content';

export type DashboardColumn = 'left' | 'right' | 'full';

/**
 * Configuration for a dashboard item
 */
interface DashboardItemConfig {

  /**
   * The item type
   */
  type: DashboardItemType;

  /**
   * The layout breakpoints allowed to show this item.
   * When not set or empty, is always visible.
   * For example:
   * - For mobile only, return `['lt-sm']`.
   * - For mobile / tablet, return `['lt-md']`.
   * - For desktop / tablet, return `['gt-xs']`.
   * - For desktop only, return `['gt-md']`.
   */
  breakpoints?: Breakpoint[];

  /**
   * In which column should the item be displayed?
   */
  column?: DashboardColumn;

  /**
   * Configuration data, specific for each item type
   */
  data?: any;

}

namespace DashboardItemConfig {

  /**
   * Common parameters for all dashboard item types
   */
  export interface DashboardItemParams {
    breakpoints?: Breakpoint[];
    column?: DashboardColumn;
  }

  /**
   * Parameters for the quick access
   */
  export interface QuickAccessParams extends DashboardItemParams {
    /**
     * Which quick access descriptors to show
     */
    descriptors: QuickAccessDescriptor[];
  }

  /**
   * Returns a generic dashboard item configuration
   * @param type The dashboard item type
   * @param params The dashboard item parameters
   * @param data The data to be passed in to the component
   */
  export function config(type: DashboardItemType, params: DashboardItemParams, data: any): DashboardItemConfig {
    return {
      type: type,
      data: data,
      breakpoints: params.breakpoints,
      column: params.column
    };
  }

  /**
   * Returns the configuration for a quick access
   */
  export function quickAccess(params: QuickAccessParams): DashboardItemConfig {
    return config(DashboardItemType.QUICK_ACCESS, params, {
      descriptors: params.descriptors
    });
  }

  /**
   * Parameters for an account status
   */
  export interface AccountStatusParams extends DashboardItemParams {
    /**
     * Which account to show
     */
    account: Account;

    /**
     * The maximum number of transfers to show in the last incoming payments.
     * When set to zero, incoming payments are not shown.
     */
    maxTransfers?: number;
  }

  /**
   * Returns the configuration for the status of an account
   */
  export function accountStatus(params: AccountStatusParams): DashboardItemConfig {
    return config(DashboardItemType.ACCOUNT_STATUS, params, {
      account: params.account,
      maxTransfers: params.maxTransfers
    });
  }

  /**
   * Parameters for showing the latest advertisements
   */
  export interface LatestAdsParams extends DashboardItemParams {
    /**
     * A list of user groups (internal names / ids)
     */
    groups?: string[];

    /**
     * Maximum number of advertisements
     */
    max?: number;
  }

  /**
   * Returns the configuration for the latest advertisements
   */
  export function latestAds(params: LatestAdsParams): DashboardItemConfig {
    return config(DashboardItemType.LATEST_ADS, params, {
      groups: params.groups,
      max: params.max == null ? 6 : params.max
    });
  }

  /**
   * Parameters for a custom content
   */
  export interface ContentParams extends DashboardItemParams, Content {

    /**
     * The optional dashboard item title
     */
    title?: string;

    /**
     * Whether the dashboard item will have no padding.
     * By default the item will have the regular padding.
     */
    tight?: boolean;
  }

  /**
   * Returns the configuration for a content in the dashboard
   */
  export function content(params: ContentParams): DashboardItemConfig {
    return config(DashboardItemType.CONTENT, params, {
      content: params,
      title: params.title,
      tight: params.tight
    });
  }
}

export { DashboardItemConfig };

