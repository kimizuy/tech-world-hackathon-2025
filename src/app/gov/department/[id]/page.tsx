import Link from "next/link";
import { notFound } from "next/navigation";
import { departments, findDepartmentById } from "../../guide/departments";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return departments.map((dept) => ({
    id: dept.id,
  }));
}

export default async function DepartmentPage({ params }: PageProps) {
  const { id } = await params;
  const department = findDepartmentById(id);

  if (!department) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-2xl p-4">
        {/* Header */}
        <header className="mb-8">
          <p className="text-emerald-400 text-sm mb-2">ご案内先</p>
          <h1 className="text-3xl font-bold mb-2">{department.name}</h1>
          <p className="text-slate-400">{department.description}</p>
        </header>

        {/* Location info */}
        <section className="mb-8 p-6 bg-slate-800 rounded-lg">
          <h2 className="text-lg font-bold mb-4">窓口情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">フロア</p>
              <p className="text-xl font-bold">{department.floor}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">窓口番号</p>
              <p className="text-xl font-bold">{department.counter}</p>
            </div>
          </div>
        </section>

        {/* Keywords */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">対応業務</h2>
          <div className="flex flex-wrap gap-2">
            {department.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 bg-slate-700 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <Link
            href={`/gov/department/${id}/verify`}
            className="block w-full rounded-lg bg-emerald-600 px-4 py-4 font-bold text-white hover:bg-emerald-500 transition-colors text-lg text-center"
          >
            番号札を発行する
          </Link>
          <Link
            href="/gov/guide"
            className="block w-full rounded-lg border border-slate-600 px-4 py-3 text-center hover:border-slate-400 transition-colors"
          >
            案内に戻る
          </Link>
        </section>
      </div>
    </main>
  );
}
