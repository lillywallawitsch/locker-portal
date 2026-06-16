import { useNavigate, useParams } from 'react-router-dom'
import { NavBreadcrumb, PageHeader } from '../lib/ooh-kit'
import DocumentationOverview from '../components/DocumentationOverview'
import DocumentationDetail from '../components/DocumentationDetail'
import { carrierSearch } from '../lib/url'

interface DocumentationRouteProps {
  carrierId: string
  navCollapsed: boolean
  onNavToggle: () => void
}

const titleCase = (slug: string) =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

/** Backs `/documentation`, `/documentation/:category` and `/documentation/:category/:article`. */
export default function DocumentationRoute({ carrierId, navCollapsed, onNavToggle }: DocumentationRouteProps) {
  const navigate = useNavigate()
  const { category, article } = useParams()
  const q = carrierSearch(carrierId)

  const goRoot = () => navigate(`/documentation${q}`)
  const goCategory = (cat: string) => navigate(`/documentation/${encodeURIComponent(cat)}${q}`)
  const goArticle = (cat: string, art?: string) =>
    navigate(`/documentation/${encodeURIComponent(cat)}${art ? `/${encodeURIComponent(art)}` : ''}${q}`)

  const breadcrumbItems = [
    category ? { label: 'Documentation', onClick: goRoot } : { label: 'Documentation' },
    ...(category && !article ? [{ label: titleCase(category) }] : []),
    ...(category && article
      ? [{ label: titleCase(category), onClick: () => goCategory(category) }, { label: titleCase(article) }]
      : []),
  ]

  return (
    <main className="flex-1 overflow-auto">
      <div className="px-[18px] pt-[21px]">
        <NavBreadcrumb items={breadcrumbItems} collapsed={navCollapsed} onToggle={onNavToggle} />
      </div>
      <div className="px-[18px] pt-[12px]">
        {!category ? (
          <>
            <PageHeader title="Documentation" />
            <div className="mt-6">
              <DocumentationOverview onArticleClick={(cat, art) => goArticle(cat, art)} />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <DocumentationDetail
              categoryId={category}
              articleId={article}
              onBack={goRoot}
              onArticleClick={(cat, art) => goArticle(cat, art)}
            />
          </div>
        )}
      </div>
    </main>
  )
}
