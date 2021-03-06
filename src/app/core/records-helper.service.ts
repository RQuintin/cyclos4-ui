import { Injectable } from '@angular/core';
import {
  AdminMenuEnum, RecordCustomField, RecordLayoutEnum, RecordPermissions,
  RecordType, RecordTypeDetailed, RoleEnum, User, UserMenuEnum
} from 'app/api/models';
import { Configuration } from 'app/configuration';
import { AuthHelperService } from 'app/core/auth-helper.service';
import { DataForUiHolder } from 'app/core/data-for-ui-holder';
import { ApiHelper } from 'app/shared/api-helper';
import { LayoutService } from 'app/shared/layout.service';
import { ActiveMenu, Menu } from 'app/shared/menu';
import { Observable } from 'rxjs';

/**
 * Helper service for records functions
 */
@Injectable({
  providedIn: 'root',
})
export class RecordHelperService {

  /** Represents the path to general record search */
  static GENERAL_SEARCH = 'general';

  constructor(
    private dataForUiHolder: DataForUiHolder,
    private layout: LayoutService,
    private authHelper: AuthHelperService,
  ) { }

  /**
   * Returns the record types within the according permissions for the logged user or system based on the given flag
   */
  recordPermissions(system?: boolean, management?: boolean): RecordPermissions[] {
    const dataForUi = this.dataForUiHolder.dataForUi;
    const auth = dataForUi.auth || {};
    const permissions = auth.permissions || {};
    const records = permissions.records || {};
    if (system) {
      return records.system || [];
    } else if (management) {
      return records.userManagement || [];
    } else {
      return records.user || [];
    }
  }
  /**
   * Resolves the path to the according record page either view, edit, or new
   */
  resolvePath(permission: RecordPermissions, owner: string): string {
    const type = permission.type;
    if (owner === RecordHelperService.GENERAL_SEARCH) {
      // Force list when doing a general search
      type.layout = RecordLayoutEnum.LIST;
    }
    const pathFunction = (id: string) => {
      let path = null;
      if (type.layout === RecordLayoutEnum.SINGLE) {
        if (permission.singleRecordId) {
          path = `view/${id}`;
        } else if (permission.create) {
          path = `${owner}/${ApiHelper.internalNameOrId(type)}/new`;
        }
      } else {
        path = `${owner}/${ApiHelper.internalNameOrId(type)}/${type.layout}`;
      }
      return `/records/${path}`;
    };
    if (type.layout === RecordLayoutEnum.SINGLE && permission.singleRecordId == null) {
      // Search single record dinamically
      for (const record of this.recordPermissions(owner === ApiHelper.SYSTEM)) {
        if (type.id === record.type.id) {
          return pathFunction(record.singleRecordId);
        }
      }
    } else {
      return pathFunction(permission.singleRecordId);
    }
  }

  /**
   * Returns the icon name that should be used for the given record type
   */
  icon(type: RecordType): string {
    const config = (Configuration.records || {})[type.internalName || '#'];
    const customIcon = (config || {}).icon;
    return customIcon || 'library_books';
  }

  /**
   * Returns if the current record type should be displayed using more than a column
   */
  isColumnLayout(type: RecordTypeDetailed): boolean {
    return type.fieldColumns > 1 && this.layout.gtxs;
  }

  /**
   * Resolves the column style for the given field based on the colspan defined
   */
  resolveColumnClass(field: RecordCustomField, type: RecordTypeDetailed): string {
    const colspan = field != null && field.colspan != null ? ' colspan-' + field.colspan : '';
    return this.isColumnLayout(type) ? 'pr-3 columns-' + type.fieldColumns + colspan : '';
  }

  /**
   * Returns the ActiveMenu which represents this record type.
   */
  activeMenuForRecordType(general: boolean, type: RecordType): ActiveMenu {
    let menu: Menu;
    if (general) {
      // General records search
      const dataForUi = this.dataForUiHolder.dataForUi;
      const auth = dataForUi.auth || {};
      menu = auth.role === RoleEnum.BROKER ? Menu.SEARCH_RECORDS_BROKERING : Menu.SEARCH_RECORDS_MARKETPLACE;
    } else if (type.adminMenu) {
      // System record type
      menu = type.adminMenu === AdminMenuEnum.SYSTEM_BANKING
        ? Menu.SEARCH_RECORDS_BANKING : Menu.SEARCH_RECORDS_MARKETPLACE;
    } else if (type.userMenu) {
      // My record type
      switch (type.userMenu) {
        case UserMenuEnum.BANKING:
          menu = Menu.SEARCH_RECORDS_BANKING;
          break;
        case UserMenuEnum.PERSONAL:
          menu = Menu.SEARCH_RECORDS_PERSONAL;
          break;
        default:
          menu = Menu.SEARCH_RECORDS_MARKETPLACE;
          break;
      }
    } else {
      // Fallback
      menu = Menu.SEARCH_RECORDS_MARKETPLACE;
    }
    return new ActiveMenu(menu, { recordType: type });
  }

  /**
   * Returns the active menu for the given record type.
   */
  menuForRecordType(user: User, type: RecordType): Menu | ActiveMenu | Observable<Menu> {
    if (!user || this.authHelper.isSelf(user)) {
      return this.activeMenuForRecordType(!user, type);
    } else {
      return this.authHelper.searchUsersMenu(user);
    }
  }

}
