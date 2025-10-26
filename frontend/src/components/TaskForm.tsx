import React from "react";

export default function TaskForm({ onCreate }: { onCreate: (title: string, description?: string)=>void }) {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), desc.trim() || undefined);
    setTitle("");
    setDesc("");
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div>
        <label htmlFor="title" className="label">Título</label>
        <input id="title" placeholder="título" className="input" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>

      <div>
        <label htmlFor="desc" className="label">Descrição</label>
        <input id="desc" placeholder="descrição" className="input" value={desc} onChange={e=>setDesc(e.target.value)} />
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary" type="submit">Criar</button>
      </div>
    </form>
  );
}


