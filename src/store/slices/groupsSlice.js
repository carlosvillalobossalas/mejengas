import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createGroup, getUserGroups } from "../../firebase/playerEndpoints";

const DEFAULT_GROUP_ID = "HpWjsA6l5WjJ7FNlC8uA";
const ACTIVE_GROUP_STORAGE_KEY = "mejengas.activeGroupId";

const loadInitialActiveGroupId = () => {
  try {
    return localStorage.getItem(ACTIVE_GROUP_STORAGE_KEY) || DEFAULT_GROUP_ID;
  } catch {
    return DEFAULT_GROUP_ID;
  }
};

const persistActiveGroupId = (groupId) => {
  try {
    localStorage.setItem(ACTIVE_GROUP_STORAGE_KEY, groupId);
  } catch {
    // ignore
  }
};

export const fetchUserGroups = createAsyncThunk(
  "groups/fetchUserGroups",
  async (userId, { rejectWithValue }) => {
    try {
      const groups = await getUserGroups(userId);
      return groups;
    } catch (error) {
      return rejectWithValue(error?.message || "Error al cargar grupos");
    }
  }
);

export const createGroupAndRefresh = createAsyncThunk(
  "groups/createGroupAndRefresh",
  async ({ userId, groupData }, { dispatch, rejectWithValue }) => {
    try {
      const groupId = await createGroup(groupData, userId);
      await dispatch(fetchUserGroups(userId)).unwrap();
      return groupId;
    } catch (error) {
      return rejectWithValue(error?.message || "Error al crear grupo");
    }
  }
);

const initialState = {
  groups: [],
  activeGroupId: loadInitialActiveGroupId(),
  loading: false,
  error: null,
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setActiveGroupId: (state, action) => {
      state.activeGroupId = action.payload;
      persistActiveGroupId(action.payload);
    },
    clearGroupsState: (state) => {
      state.groups = [];
      state.loading = false;
      state.error = null;
      state.activeGroupId = loadInitialActiveGroupId();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload || [];

        // Si el grupo activo no existe en la lista, escoger el primero disponible
        if (state.groups.length > 0) {
          const exists = state.groups.some((g) => g.id === state.activeGroupId);
          if (!exists) {
            state.activeGroupId = state.groups[0].id;
            persistActiveGroupId(state.activeGroupId);
          }
        }
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al cargar grupos";
      })
      .addCase(createGroupAndRefresh.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupAndRefresh.fulfilled, (state, action) => {
        state.loading = false;
        // Seleccionar automáticamente el grupo recién creado
        if (action.payload) {
          state.activeGroupId = action.payload;
          persistActiveGroupId(action.payload);
        }
      })
      .addCase(createGroupAndRefresh.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al crear grupo";
      })
      // Limpieza al hacer logout
      .addCase("auth/logout/fulfilled", (state) => {
        state.groups = [];
        state.loading = false;
        state.error = null;
        state.activeGroupId = loadInitialActiveGroupId();
      })
      .addCase("auth/setUser", (state, action) => {
        if (!action.payload) {
          state.groups = [];
          state.loading = false;
          state.error = null;
          state.activeGroupId = loadInitialActiveGroupId();
        }
      });
  },
});

export const { setActiveGroupId, clearGroupsState } = groupsSlice.actions;
export default groupsSlice.reducer;

export const selectGroups = (state) => state.groups.groups;
export const selectGroupsLoading = (state) => state.groups.loading;
export const selectGroupsError = (state) => state.groups.error;
export const selectActiveGroupId = (state) => state.groups.activeGroupId;
