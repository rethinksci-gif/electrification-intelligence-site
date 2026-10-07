import { PageLayout, SharedLayout } from "./quartz/cfg"
import Head from "./quartz/components/Head"
import { PublicationHeader, PublicationTitle, PublicationFooter, PublicationListing } from "./quartz/components/Publication"
export const sharedPageComponents: SharedLayout = { head: Head(), header: [], afterBody: [PublicationListing], footer: PublicationFooter }
export const defaultContentPageLayout: PageLayout = { beforeBody: [PublicationHeader, PublicationTitle], left: [], right: [] }
export const defaultListPageLayout = defaultContentPageLayout
