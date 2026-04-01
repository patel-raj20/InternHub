import os

file_path = r'e:\Intern_Hub\InternHub\src\components\interns\intern-table.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Row action block to replace (Management view)
old_action_1 = """                      <Link href={`${mode === 'SUPER_ADMIN' ? '/super-admin' : '/admin'}/interns/${intern.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>"""

new_action_1 = """                      <Link href={`${mode === 'SUPER_ADMIN' ? '/super-admin' : '/admin'}/interns/${intern.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-primary/10 hover:bg-primary/5">
                          <Eye className="w-4 h-4 text-primary/60" />
                        </Button>
                      </Link>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 border-orange-500/10 hover:bg-orange-500/5 group/btn"
                        onClick={() => setAssignTaskTarget([intern.id])}
                      >
                        <ClipboardPlus className="w-4 h-4 text-orange-500/60 group-hover/btn:text-orange-500 transition-colors" />
                      </Button>"""

# Replace all occurrences (covering both variants if they are identical)
content = content.replace(old_action_1, new_action_1)

# Also fix the inner buttons for edit/trash if needed (already mostly done in previous attempt, but let's be sure)
# The Eye button was replaced twice above.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated InternTable.tsx row actions.")
