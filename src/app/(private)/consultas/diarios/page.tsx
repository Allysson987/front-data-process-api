
'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Search,
  RefreshCw,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  FileJson,
  CalendarDays,
  Building2,
  X,
  CheckCircle2,
  Clock,
  Loader2,
  Eye,
} from 'lucide-react';

import { fetchApi } from '@/lib/api';

interface Diary {
  id: number;
  source: string;
  source_id: string;
  publication_date: string;
  available_date: string;
  update_date: string;
  title: string;
  content: string;
  pdf_url: string | null;
}

interface DiaryResponse {
  status: string;
  source: string;
  info: Diary[];
}

interface DiaryState {
  uf: string;
  source: string;
}

interface DiaryStatesResponse {
  status: string;
  info: DiaryState[];
}

interface SyncStatus {
  uf: string;
  info: {
    source?: string;
    status?: string;
    saved_count?: string;
    current_source_id?: string;
    started_at?: string;
    updated_at?: string;
    error?: string;
    finished_at?: string;
  };
}

interface SearchParams {
  uf: string;
  limit: number;
}

function formatDate(value?: string | null): string {
  if (!value) return 'Não informado';

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Não informado';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('pt-BR');
}

function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], {
    type: 'application/json;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function getDiaryKey(diary: Diary, index: number): string {
  return `${diary.id}-${diary.source_id}-${index}`;
}

function getStatusLabel(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'Concluído';
    case 'running':
      return 'Em execução';
    case 'pending':
      return 'Pendente';
    case 'failed':
      return 'Falhou';
    default:
      return status || 'Desconhecido';
  }
}

export default function DiaryPage() {
  const [uf, setUf] = useState('PE');
  const [limit, setLimit] = useState(10);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    uf: 'PE',
    limit: 10,
  });

  const [contentSearch, setContentSearch] = useState('');
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);

  // Estados disponíveis no RulesDiary.
  const {
    data: availableStates,
    isLoading: isLoadingStates,
    isError: isStatesError,
  } = useQuery<DiaryStatesResponse>({
    queryKey: ['diary-available-states'],
    queryFn: async () => {
      return await fetchApi(
        '/api/process_search/diary/states'
      ) as DiaryStatesResponse;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Seleciona automaticamente a primeira UF disponível caso PE não exista.
  useEffect(() => {
    const states = availableStates?.info;

    if (!states?.length) return;

    const currentUfExists = states.some(
      (state) => state.uf === uf
    );

    if (!currentUfExists) {
      setUf(states[0].uf);
    }
  }, [availableStates, uf]);

  // Consulta os diários.
  const {
    data: diaryData,
    isLoading: isLoadingDiaries,
    isError: isDiariesError,
    error: diaryError,
    refetch: refetchDiaries,
    isFetching: isFetchingDiaries,
  } = useQuery<DiaryResponse>({
    queryKey: [
      'diaries',
      searchParams.uf,
      searchParams.limit,
    ],
    queryFn: async () => {
      return await fetchApi(
        `/api/process_search/diary/${searchParams.uf}?limit=${searchParams.limit}`
      ) as DiaryResponse;
    },
    enabled: Boolean(searchParams.uf),
  });

  // Consulta o status da sincronização.
  const {
    data: syncStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery<SyncStatus>({
    queryKey: ['diary-status', searchParams.uf],
    queryFn: async () => {
      return await fetchApi(
        `/api/process_search/diary/${searchParams.uf}/status`
      ) as SyncStatus;
    },
    enabled: Boolean(searchParams.uf),
    refetchInterval: (query) => {
      const status = query.state.data?.info?.status;

      return status === 'running' ? 5000 : false;
    },
  });

  const diaries = diaryData?.info ?? [];

  // Filtra pelo título, número ou conteúdo.
  const filteredDiaries = useMemo(() => {
    const normalizedSearch = contentSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return diaries;
    }

    return diaries.filter((diary) => {
      const title = diary.title?.toLowerCase() ?? '';
      const content = diary.content?.toLowerCase() ?? '';
      const sourceId = diary.source_id?.toLowerCase() ?? '';

      return (
        title.includes(normalizedSearch) ||
        content.includes(normalizedSearch) ||
        sourceId.includes(normalizedSearch)
      );
    });
  }, [diaries, contentSearch]);

  // Fecha o modal com ESC.
  useEffect(() => {
    if (!selectedDiary) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedDiary(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDiary]);

  // Evita rolagem da página enquanto o modal estiver aberto.
  useEffect(() => {
    if (!selectedDiary) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedDiary]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedUf = uf.trim().toUpperCase();

    const isAvailable = availableStates?.info.some(
      (state) => state.uf === normalizedUf
    );

    if (!isAvailable) return;

    setContentSearch('');
    setSelectedDiary(null);

    setSearchParams({
      uf: normalizedUf,
      limit,
    });
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchDiaries(),
      refetchStatus(),
    ]);
  };

  const handleDownloadJson = () => {
    if (!diaryData) return;

    downloadJson(
      diaryData,
      `diarios-${searchParams.uf}-${new Date()
        .toISOString()
        .slice(0, 10)}.json`
    );
  };

  const isSearching = isLoadingDiaries || isFetchingDiaries;

  const currentStatus = syncStatus?.info?.status;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Cabeçalho */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-blue-700">
              <FileText size={22} />

              <span className="text-sm font-semibold">
                Consulta de publicações
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Diários Oficiais
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Consulte publicações dos tribunais disponíveis na plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isSearching ? 'animate-spin' : ''}
            />

            Atualizar
          </button>
        </header>

        {/* Formulário de consulta */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">
              Parâmetros da consulta
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Selecione o estado e a quantidade de publicações.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="w-full flex-1">
              <label
                htmlFor="uf"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Estado (UF)
              </label>

              <select
                id="uf"
                value={uf}
                onChange={(event) => setUf(event.target.value)}
                disabled={isLoadingStates || isStatesError}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingStates
                    ? 'Carregando estados...'
                    : 'Selecione um estado'}
                </option>

                {availableStates?.info.map((state) => (
                  <option key={state.uf} value={state.uf}>
                    {state.uf} — {state.source}
                  </option>
                ))}
              </select>

              {isStatesError && (
                <p className="mt-1 text-xs text-red-600">
                  Não foi possível carregar os estados disponíveis.
                </p>
              )}

              {!isLoadingStates &&
                !isStatesError &&
                !availableStates?.info.length && (
                  <p className="mt-1 text-xs text-amber-600">
                    Nenhum estado disponível para consulta.
                  </p>
                )}
            </div>

            <div className="w-full sm:w-44">
              <label
                htmlFor="limit"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Quantidade
              </label>

              <select
                id="limit"
                value={limit}
                onChange={(event) =>
                  setLimit(Number(event.target.value))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value={5}>5 diários</option>
                <option value={10}>10 diários</option>
                <option value={20}>20 diários</option>
                <option value={30}>30 diários</option>
                <option value={50}>50 diários</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={
                !uf ||
                isLoadingStates ||
                isStatesError ||
                !availableStates?.info.some(
                  (state) => state.uf === uf
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search size={17} />
              Consultar
            </button>
          </form>
        </section>

        {/* Status da sincronização */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />

              <h2 className="font-semibold text-gray-900">
                Status da sincronização
              </h2>
            </div>

            {isLoadingStatus && (
              <Loader2
                size={16}
                className="animate-spin text-gray-400"
              />
            )}
          </div>

          {syncStatus?.info ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Estado
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {syncStatus.uf}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Situação
                </p>

                <div className="mt-1 flex items-center gap-2">
                  {currentStatus === 'completed' ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : currentStatus === 'running' ? (
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                  ) : (
                    <AlertCircle size={16} className="text-gray-500" />
                  )}

                  <span className="font-semibold text-gray-800">
                    {getStatusLabel(currentStatus)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Registros salvos
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {syncStatus.info.saved_count ?? '0'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Última atualização
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatDateTime(syncStatus.info.updated_at)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Não há informações de sincronização disponíveis para este estado.
            </p>
          )}

          {syncStatus?.info?.error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {syncStatus.info.error}
            </div>
          )}
        </section>

        {/* Resultados */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Publicações encontradas
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredDiaries.length} publicação(ões)
                {contentSearch && ' correspondentes à pesquisa'}
                {' '}para {searchParams.uf}.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadJson}
              disabled={!diaries.length}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileJson size={16} />
              Exportar JSON
              <Download size={15} />
            </button>
          </div>

          {/* Pesquisa no conteúdo */}
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={contentSearch}
              onChange={(event) =>
                setContentSearch(event.target.value)
              }
              placeholder="Pesquisar por título, número ou conteúdo..."
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {contentSearch && (
              <button
                type="button"
                onClick={() => setContentSearch('')}
                aria-label="Limpar pesquisa"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* Carregamento */}
          {isLoadingDiaries && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="mt-4 text-sm font-medium text-gray-700">
                Carregando publicações...
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Consultando os diários de {searchParams.uf}.
              </p>
            </div>
          )}

          {/* Erro */}
          {isDiariesError && !isLoadingDiaries && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <h3 className="font-semibold text-red-800">
                  Erro ao consultar os diários
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  {diaryError instanceof Error
                    ? diaryError.message
                    : 'Não foi possível carregar as publicações.'}
                </p>
              </div>
            </div>
          )}

          {/* Lista vazia */}
          {!isLoadingDiaries &&
            !isDiariesError &&
            filteredDiaries.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-14 text-center">
                <FileText size={36} className="text-gray-300" />

                <h3 className="mt-4 font-semibold text-gray-800">
                  Nenhuma publicação encontrada
                </h3>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                  {contentSearch
                    ? 'Não encontramos publicações correspondentes ao termo pesquisado.'
                    : 'Não existem publicações disponíveis para os parâmetros selecionados.'}
                </p>
              </div>
            )}

          {/* Cards compactos */}
          {!isLoadingDiaries &&
            filteredDiaries.map((diary, index) => {
              const diaryKey = getDiaryKey(diary, index);

              return (
                <article
                  key={diaryKey}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300"
                >
                  <div className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                            <Building2 size={13} />
                            {diary.source}
                          </span>

                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            ID: {diary.source_id}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">
                          {diary.title || 'Diário Oficial'}
                        </h3>
                      </div>

                      {diary.pdf_url && (
                        <a
                          href={diary.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          <FileText size={15} />
                          PDF original
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {/* Metadados */}
                    <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-start gap-2">
                        <CalendarDays size={16} className="mt-0.5 shrink-0 text-gray-400" />

                        <div>
                          <p className="text-xs text-gray-400">
                            Data de publicação
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-gray-700">
                            {formatDate(diary.publication_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <CalendarDays size={16} className="mt-0.5 shrink-0 text-gray-400" />

                        <div>
                          <p className="text-xs text-gray-400">
                            Data de disponibilização
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-gray-700">
                            {formatDate(diary.available_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock size={16} className="mt-0.5 shrink-0 text-gray-400" />

                        <div>
                          <p className="text-xs text-gray-400">
                            Atualização do registro
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-gray-700">
                            {formatDateTime(diary.update_date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prévia clicável */}
                    <button
                      type="button"
                      onClick={() => setSelectedDiary(diary)}
                      className="mt-5 block w-full rounded-lg bg-gray-50 p-4 text-left transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Conteúdo da publicação
                        </span>

                        <Eye
                          size={16}
                          className="shrink-0 text-blue-600"
                        />
                      </div>

                      <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                        {diary.content || 'Conteúdo não disponível.'}
                      </p>

                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                        Ver conteúdo completo
                        <ExternalLink size={14} />
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
        </section>

        {/* Rodapé */}
        <footer className="border-t border-gray-200 pt-5">
          <p className="text-center text-xs text-gray-400">
            Os documentos originais são disponibilizados pelos respectivos tribunais.
          </p>
        </footer>
      </div>

      {/* Modal de leitura */}
      {selectedDiary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDiary(null);
            }
          }}
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="diary-modal-title"
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Cabeçalho do modal */}
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-7">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                    {selectedDiary.source}
                  </span>

                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    ID: {selectedDiary.source_id}
                  </span>
                </div>

                <h2
                  id="diary-modal-title"
                  className="text-lg font-bold text-gray-900 sm:text-xl"
                >
                  {selectedDiary.title || 'Diário Oficial'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDiary(null)}
                aria-label="Fechar modal"
                className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={22} />
              </button>
            </header>

            {/* Metadados do modal */}
            <div className="grid shrink-0 grid-cols-1 gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 sm:grid-cols-3 sm:px-7">
              <div>
                <p className="text-xs text-gray-400">
                  Data de publicação
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {formatDate(selectedDiary.publication_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Disponibilização
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {formatDate(selectedDiary.available_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Atualização do registro
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {formatDateTime(selectedDiary.update_date)}
                </p>
              </div>
            </div>

            {/* Conteúdo completo com rolagem independente */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
              <div className="mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />

                <h3 className="text-sm font-semibold text-gray-800">
                  Conteúdo integral da publicação
                </h3>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-gray-700">
                  {selectedDiary.content || 'Conteúdo não disponível.'}
                </pre>
              </div>
            </div>

            {/* Rodapé do modal */}
            <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-xs text-gray-400">
                Registro #{selectedDiary.id}
              </p>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                {selectedDiary.pdf_url && (
                  <a
                    href={selectedDiary.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <Download size={16} />
                    Abrir PDF original
                    <ExternalLink size={14} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedDiary(null)}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
                >
                  Fechar leitura
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
