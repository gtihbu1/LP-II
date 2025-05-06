(function() {
    const form = document.getElementById('item-form');
    const input = document.getElementById('item-input');
    const addButton = document.getElementById('add-button');
    const list = document.getElementById('items-list');

    let items = [];

    // Load saved items from localStorage
    function loadItems() {
      const saved = localStorage.getItem('crudItems');
      if (saved) {
        try {
          items = JSON.parse(saved);
        } catch(err) {
          items = [];
        }
      }
    }
    // Save items to localStorage
    function saveItems() {
      localStorage.setItem('crudItems', JSON.stringify(items));
    }

    // Render the items list
    function renderList() {
      list.innerHTML = '';
      items.forEach((item, index) => {
        const li = document.createElement('li');
        li.setAttribute('data-index', index);

        if(item.editing){
          li.classList.add('editing');
          const inputEdit = document.createElement('input');
          inputEdit.type = 'text';
          inputEdit.value = item.text;
          inputEdit.setAttribute('aria-label', 'Edit item text');
          inputEdit.autofocus = true;

          inputEdit.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              saveEdit(index, inputEdit.value.trim());
            } else if(e.key === 'Escape') {
              cancelEdit(index);
            }
          });

          li.appendChild(inputEdit);

          const actionsDiv = document.createElement('div');
          actionsDiv.className = 'actions';

          const saveBtn = document.createElement('button');
          saveBtn.className = 'btn save';
          saveBtn.title = 'Save';
          saveBtn.ariaLabel = 'Save edited item';
          saveBtn.innerHTML = '✔';
          saveBtn.addEventListener('click', () => {
            saveEdit(index, inputEdit.value.trim());
          });

          const cancelBtn = document.createElement('button');
          cancelBtn.className = 'btn cancel';
          cancelBtn.title = 'Cancel';
          cancelBtn.ariaLabel = 'Cancel editing';
          cancelBtn.innerHTML = '✖';
          cancelBtn.addEventListener('click', () => {
            cancelEdit(index);
          });

          actionsDiv.appendChild(saveBtn);
          actionsDiv.appendChild(cancelBtn);
          li.appendChild(actionsDiv);

        } else {
          li.textContent = item.text;

          const actionsDiv = document.createElement('div');
          actionsDiv.className = 'actions';

          const editBtn = document.createElement('button');
          editBtn.className = 'btn edit';
          editBtn.title = 'Edit';
          editBtn.ariaLabel = 'Edit item';
          editBtn.innerHTML = '✎';
          editBtn.addEventListener('click', () => {
            editItem(index);
          });

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn delete';
          deleteBtn.title = 'Delete';
          deleteBtn.ariaLabel = 'Delete item';
          deleteBtn.innerHTML = '🗑';
          deleteBtn.addEventListener('click', () => {
            deleteItem(index);
          });

          actionsDiv.appendChild(editBtn);
          actionsDiv.appendChild(deleteBtn);
          li.appendChild(actionsDiv);
        }

        list.appendChild(li);
      });

      if(items.length === 0){
        const li = document.createElement('li');
        li.style.color = '#666';
        li.style.fontStyle = 'italic';
        li.textContent = 'No items added yet.';
        list.appendChild(li);
      }
    }

    // Add a new item
    function addItem(text){
      if(text === '') return;
      items.push({ text: text, editing: false });
      saveItems();
      renderList();
    }

    // Edit item - enter edit mode
    function editItem(index){
      items = items.map((item, i) => ({
        ...item,
        editing: i === index
      }));
      renderList();
    }

    // Save edited item
    function saveEdit(index, newText){
      if(newText === ''){
        deleteItem(index);
        return;
      }
      items[index].text = newText;
      items[index].editing = false;
      saveItems();
      renderList();
    }

    // Cancel edit mode
    function cancelEdit(index){
      items[index].editing = false;
      saveItems();
      renderList();
    }

    // Delete item
    function deleteItem(index){
      items.splice(index, 1);
      saveItems();
      renderList();
    }

    // Validate input and toggle button disabled
    input.addEventListener('input', () => {
      addButton.disabled = input.value.trim() === '';
    });

    // Handle form submission
    form.addEventListener('submit', e => {
      e.preventDefault();
      const value = input.value.trim();
      if(value === '') return;
      addItem(value);
      input.value = '';
      addButton.disabled = true;
      input.focus();
    });

    loadItems();
    renderList();
  })();