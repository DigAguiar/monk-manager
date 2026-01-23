import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Monk } from '../types/monk.type'
import { MultiSelect } from './MultiSelect'

interface MonkFormProps {
  initialData?: Monk
  onSubmit: (data: Monk) => void
  onCancel: () => void
  existingOccupations?: string[]
}

type MonkFormValues = Omit<Monk, 'livros'> & {
  livros: { value: string }[]
}

const maskDate = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{4})\d+?$/, '$1')
}

export function MonkForm({ initialData, onSubmit, onCancel, existingOccupations = [] }: MonkFormProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [livroInput, setLivroInput] = useState('')

  const defaultValues: MonkFormValues = {
    ...initialData,
    nome: initialData?.nome || '',
    ocupacao_oficio: initialData?.ocupacao_oficio || [], 
    livros: initialData?.livros?.map((l) => ({ value: l })) || []
  } as MonkFormValues

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<MonkFormValues>({
    defaultValues
  })

  const currentOccupations = watch('ocupacao_oficio');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'livros'
  })

  const onFormSubmit = (data: MonkFormValues) => {
    const finalData: Monk = {
      ...data,
      livros: data.livros.map((item) => item.value)
    }
    onSubmit(finalData)
  }

  const handleAddLivro = (e: any) => {
    e.preventDefault()
    if (livroInput.trim()) {
      append({ value: livroInput.trim() })
      setLivroInput('')
    }
  }

  const DateInput = ({ name, label, placeholder }: { name: any, label: string, placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="text"
        placeholder={placeholder || 'DD/MM/AAAA'}
        maxLength={10}
        {...register(name)}
        className="w-full p-2 border rounded"
        onChange={(e) => setValue(name, maskDate(e.target.value))}
      />
    </div>
  )

  const tabs = ['Vida & Origem', 'Vida Monástica', 'Legado & Fim']

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="bg-white p-6 rounded shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{initialData ? 'Editar Monge' : 'Novo Monge'}</h2>

      <div className="flex border-b mb-6">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(index)}
            className={`px-6 py-2 font-medium outline-none transition-colors ${activeTab === index ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {/* ABA 1: VIDA E ORIGEM */}
        {activeTab === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium">Nome Completo *</label>
              <input {...register('nome', { required: true })} className="w-full p-2 border rounded" />
              {errors.nome && <span className="text-red-500 text-xs">Nome é obrigatório</span>}
            </div>

            {/* OCUPAÇÃO VEIO PARA CA (PRIMEIRA PÁGINA) */}
            <div className="col-span-2">
                <MultiSelect 
                    label="Ocupações / Ofícios / Títulos"
                    options={existingOccupations}
                    value={currentOccupations || []}
                    onChange={(newVal) => setValue('ocupacao_oficio', newVal)}
                    placeholder="Selecione da lista ou digite um novo e aperte Enter"
                />
            </div>

            <DateInput name="data_nascimento" label="Data Nascimento" />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">País Nascimento</label>
                <input {...register('pais_nascimento')} placeholder="Ex: Brasil" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Cidade Nascimento</label>
                <input {...register('cidade_nascimento')} placeholder="Ex: Salvador" className="w-full p-2 border rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Nome do Pai</label>
              <input {...register('nome_pai')} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Nome da Mãe</label>
              <input {...register('nome_mae')} className="w-full p-2 border rounded" />
            </div>
            <DateInput name="data_batismo" label="Data Batismo" />
            <div>
              <label className="block text-sm font-medium">Local Batismo</label>
              <input {...register('local_batismo')} className="w-full p-2 border rounded" />
            </div>
          </div>
        )}

        {/* ABA 2: VIDA MONÁSTICA */}
        {activeTab === 1 && (
          <div className="grid grid-cols-2 gap-4">
            
            {/* Campos restantes da vida monástica */}
            <div className="grid grid-cols-2 gap-2">
              <DateInput name="data_ingresso_mosteiro" label="Ingresso" />
              <DateInput name="data_profissao_religiosa" label="Profissão Rel." />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Local Profissão Religiosa</label>
              <input {...register('local_profissao_religiosa')} className="w-full p-2 border rounded" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Formação Acadêmica/Teológica</label>
              <textarea {...register('formacao')} className="w-full p-2 border rounded h-20" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Matéria Ensinada</label>
              <input {...register('materia_ensinada')} className="w-full p-2 border rounded" />
            </div>
          </div>
        )}

        {/* ABA 3: LEGADO & FIM */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 gap-4">
            <div className="border p-4 rounded bg-gray-50">
              <label className="block text-sm font-bold mb-2">Livros Escritos ou Possuídos</label>
              <div className="flex gap-2 mb-2">
                <input value={livroInput} onChange={(e) => setLivroInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddLivro(e)} placeholder="Digite o livro e Enter" className="flex-1 p-2 border rounded" />
                <button type="button" onClick={handleAddLivro} className="bg-green-600 text-white px-4 rounded hover:bg-green-700">+</button>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {fields.map((field, index) => (
                  <li key={field.id} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                    <input {...register(`livros.${index}.value`)} className="flex-1 outline-none bg-transparent" readOnly />
                    <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 font-bold ml-2">x</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DateInput name="data_falecimento" label="Data Falecimento" />
              <div>
                <label className="block text-sm font-medium">Nome do Abade da Época</label>
                <input {...register('nome_abade')} className="w-full p-2 border rounded" />
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium">Doenças/Causa Mortis</label>
               <input {...register('doencas')} className="w-full p-2 border rounded" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium">Efemérides</label><input {...register('episodios_efemerides')} className="w-full p-2 border rounded" /></div>
              <div><label className="block text-sm font-medium">Exercícios Espirituais</label><input {...register('exercicios_espirituais')} className="w-full p-2 border rounded" /></div>
            </div>

            <div><label className="block text-sm font-medium">Referência Manuscrito</label><input {...register('referencia_manuscrito')} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-sm font-medium">Referência Edição</label><input {...register('referencia_edicao')} className="w-full p-2 border rounded" /></div>

            <div>
              <label className="block text-sm font-bold mt-4">Observações Gerais</label>
              <textarea 
                {...register('observacoes')} 
                className="w-full p-3 border rounded h-32 text-sm shadow-inner" 
                placeholder="Digite aqui observações adicionais. Shift+Enter quebra linha."
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow">Salvar Monge</button>
      </div>
    </form>
  )
}