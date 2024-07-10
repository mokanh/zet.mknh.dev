import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {},
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.DesktopOnly(Component.RecentNotes({
      title: "📝 Blog Post",
      showTags: false,
      limit: 3,
      filter: (f) => f.frontmatter?.tags?.includes('blog') || false,
      linkToMore: "tags/blog" as SimpleSlug,
    }),),
    Component.DesktopOnly(Component.RecentNotes({
      title: "♻️ Evergreen",
      showTags: false,
      limit: 3,
      filter: (f) => f.frontmatter?.tags?.includes('evergreen') || false,
      linkToMore: "tags/evergreen" as SimpleSlug,
    }),),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
  ],
  right: [],
}
